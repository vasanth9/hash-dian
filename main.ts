/* eslint-disable @typescript-eslint/no-explicit-any */
import { App, Editor, MarkdownView, Modal, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { load as yamlToJson } from 'js-yaml';

interface HashDianPluginSettings {
	APIToken: string;
	PublicationID: string
}

const ERROR_CODES = {
	INVALID_METADATA: "Invalid MetaData",
	INVALID_DATA: "Invalid Data",
	NO_ERROR: "",
	ERROR_API_MODAL: "👾 Error While Publishing the Blog"
}

const BasicBlogTemplate = `---
title:
subtitle:
coverImageURL.coverImageOptions:
tags:
  -
---
`;

const AdvancedBlogTemplate = `---
title:
subtitle:
publishedAt: ${new Date().toISOString()}
coverImageURL.coverImageOptions:
isCoverAttributionHidden.coverImageOptions:
coverImageAttribution.coverImageOptions:
coverImagePhotographer.coverImageOptions:
stickCoverToBottom.coverImageOptions:
slug:
originalArticleURL:
tags:
  -
disableComments: false
metaTags.title:
metaTags.description:
metaTags.image:
publishAs:
seriesId:
scheduled.settings: false
enableTableOfContent.settings: false
slugOverridden.settings: false
isNewsletterActivated.settings: false
delisted.settings: false
coAuthors:
  -
---
`;

const DEFAULT_SETTINGS: HashDianPluginSettings = {
	APIToken: '',
	PublicationID: ''
}

let ErrorData: any = null;
let SuccessData: any = null;

export default class HashDianPlugin extends Plugin {
	settings: HashDianPluginSettings;

	async onload() {
		await this.loadSettings();

		// publish to hashnode command
		this.addCommand({
			id: 'publish-to-hashnode',
			name: 'Publish to Hashnode',
			editorCallback: () => { handleEditorCallBack(this.app, this.settings); }
		});

		//basic hashnode blog template
		this.addCommand({
			id: 'basic-hashnode-blog-template',
			name: 'Basic Hashnode Blog Template',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.setLine(0, BasicBlogTemplate + editor.getLine(0));
			}
		});

		//advanced hashnode blog template
		this.addCommand({
			id: 'advanced-hashnode-blog-template',
			name: 'Advanced Hashnode Blog Template',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				editor.setLine(0, AdvancedBlogTemplate + editor.getLine(0));
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

const handleEditorCallBack = (app: App, settings: HashDianPluginSettings) => {
	const view = app.workspace.getActiveViewOfType(MarkdownView);
	const { config, contentMarkdown, error } = parseDataForPublication(view?.data);
	if (error === ERROR_CODES.NO_ERROR) {
		// publish the article
		publishArticle(settings, app, { ...config, contentMarkdown })
	} else {
		// show err modal
		const response = {
			errors: {
				error
			}
		}
		ErrorData = response;
		new ErrorAPIModal(app).open();
	}
}
const parseDataForPublication = (data: string | undefined): any => {
	try {
		if (data) {
			const lines: string[] = data?.split("\n");
			const numberOfLines: number = lines.length;

			// get metaDataIndices 
			const indexes = [];
			for (let i = 0; i < numberOfLines; i++) {
				if (/^---/.test(lines[i])) {
					indexes.push(i);
				}
				if (indexes.length === 2) {
					break;
				}
			}
			if (indexes.length !== 2) {
				// implement error functionality
				return { metadata: "", content: "", error: ERROR_CODES.INVALID_METADATA }
			}

			const metaDataLines = lines.slice(indexes[0] + 1, indexes[1]);
			const contentLines = lines.slice(indexes[1] + 1);

			let config: any = yamlToJson(metaDataLines.join("\n"));

			// remove null values
			config = JSON.parse(JSON.stringify(config, (key, value) => {
				return (value === null ? undefined : value);
			}));

			// convert child.parent to object parent { child: }
			config = Object.entries(config).reduce((newObj: any, [key, value]) => {
				const keys = key.split('.');
				if (keys.length === 1) {
					newObj[key] = value;
				} else {
					newObj[keys[1]] = newObj[keys[1]] || {};
					newObj[keys[1]][keys[0]] = value;
				}
				return newObj;
			}, {});

			if (typeof config.tags === 'string') {
				config["tags"] = config?.tags?.split(/, \s*/)
			}

			config.tags = config?.tags?.map((tag: any) => { return { slug: tag, name: tag } }) || [];

			return {
				config,
				contentMarkdown: contentLines.join("\n"),
				error: ERROR_CODES.NO_ERROR
			}


		}
	}
	catch (err) {
		return { metadata: "", content: "", error: err }
	}

	return { metadata: "", content: "", error: ERROR_CODES.INVALID_DATA }
}

const publishArticle = (settings: HashDianPluginSettings | null, app: App, data: any) => {

	const API_URL = 'https://gql.hashnode.com';

	const API_QUERY = 'mutation createPost($input: PublishPostInput!) {publishPost(input: $input) { post { title url } } } ';

	const input = {
		...data,
		publicationId: data?.PublicationID || settings?.PublicationID,
	};

	fetch(API_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: settings?.APIToken || ""
		},
		body: JSON.stringify({
			query: API_QUERY,
			variables: { input },
		}),
	})
		.then(res => res.json())
		.then(res => {
			console.log(res);
			if (res?.errors?.length) {
				ErrorData = res;
				new ErrorAPIModal(app).open();
			}
			else {
				const post = res?.data?.publishPost?.post;

				if (post) {
					SuccessData = post;
					new SuccessAPIModal(app).open();
				}
			}
		})
}

class SuccessAPIModal extends Modal {
	constructor(app: App) {
		super(app);
	}
	async onOpen() {
		const { contentEl, titleEl } = this;
		const { title, url } = SuccessData;
		if (title.length) {
			titleEl.setText("Your Blog " + title + " has been Published 🎉");
		}
		if (url.length) {
			contentEl.setText(url);
			contentEl.setCssProps({ color: "green", cursor: "pointer" })
			contentEl.addEventListener("click", () => {
				window.open(url, "_blank");
			})
		}
	}

	onClose() {
		const { contentEl } = this;
		SuccessData = null;
		contentEl.empty();
	}
}

class ErrorAPIModal extends Modal {
	constructor(app: App) {
		super(app);
	}
	async onOpen() {
		const { contentEl, titleEl } = this;
		titleEl.setText(ERROR_CODES.ERROR_API_MODAL);
		const errors = ErrorData.errors

		if (errors.length) {
			for (let i = 0; i < errors.length; i++) {
				contentEl.setText(JSON.stringify(errors[i], null, 2));
			}
		}
	}

	onClose() {
		const { contentEl } = this;
		ErrorData = null;
		contentEl.empty();
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: HashDianPlugin;

	constructor(app: App, plugin: HashDianPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Hashnode Personal Access Token')
			.setDesc('Personal Access Token is like a private key to your Hashnode account. You can use a personal access token to interact with your Hashnode account using our APIs. Never disclose your access tokens and always keep them private. You can revoke the generated tokens any time.')
			.addText(text => text
				.setPlaceholder('Enter your Hashnode Personal Access Token')
				.setValue(this.plugin.settings.APIToken)
				.onChange(async (value) => {
					this.plugin.settings.APIToken = value;
					await this.plugin.saveSettings();
				}));
		new Setting(containerEl)
			.setName('Hashnode Personal Publication Id')
			.setDesc('The ID of publication the post belongs to.')
			.addText(text => text
				.setPlaceholder('Enter your Hashnode Personal Publication Id')
				.setValue(this.plugin.settings.PublicationID)
				.onChange(async (value) => {
					this.plugin.settings.PublicationID = value;
					await this.plugin.saveSettings();
				}));
	}
}
