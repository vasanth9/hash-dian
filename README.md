# HashDian Plugin

Hash-Dian is an Obsidian plugin designed to simplify the process of publishing notes directly to your Hashnode blog.

## Features

- Publish notes directly to your Hashnode blog.
- Provides basic and advanced templates to configure the Hashnode blog for hustle free publishing
- Integrates seamlessly with Obsidian's existing interface.

## Installation

Currently, the plugin is not available in the Obsidian community plugins list. You will need to manually install it. Follow these steps:

- Download the latest release from the releases page.
- Extract the downloaded zip file.
- Copy the extracted folder to your Obsidian vault's `.obsidian/plugins/` directory.
- Enable the plugin in Obsidian's settings.

## Configure Settings

To configure Hash-Dian, you need to set up two pieces of information: the Hashnode Personal Access Token and the Hashnode Personal Publication Id.

### Hashnode Personal Access Token

The Personal Access Token is like a private key to your Hashnode account. You can use this personal access token to interact with your Hashnode account using the Hashnode API. Here is how to generate your Hashnode Developer Access Token:

1. Log in to your Hashnode account.
2. Click on your profile picture at the bottom-left corner of the page on desktop screen or top-right corner on mobile screen.
3. Click on the Account Settings option from the popup modal to access the settings page.
4. Click on the DEVELOPER tab.
5. Click the Generate New Token button to generate a new token for your account.
6. Copy auto-generated token in the Your Tokens section.
7. Go to Obsidian's settings and paste the token in HashDian Community Settings `Hashnode Personal Access Token`.

### Hashnode Personal Publication Id

The ID of publication the post belongs to.This can be found in your Hashnode Dashboard url : `https://hashnode.com/{Publication Id}/dashboard`.

Copy the Publication ID and paste it in HashDian Community Settings `Hashnode Personal Publication Id`.

### Usage

Once installed, you can access Hash-Dian from Obsidian's command palette. In Obsidian, the command palette is a powerful tool that allows you to quickly perform operations. For the Hash-Dian plugin, you can add three operations: "Publish to Hashnode", "Basic Hashnode Blog Template", and "Advanced Hashnode Blog Template".

### Publish to Hashnode

This operation allows users to publish their notes directly to their Hashnode blog. This command parses the markdown content the user currently in and extracts the meta data, blog content  and convert it into the format required by the Hashnode API, and then send a POST request to the API endpoint for creating a new post.

### Basic Hashnode Blog Template

This operation should allow users to apply basic template which is enough to publish a Hashnode blog. This command inserts the below properties for your blog:

```yaml

---
title:
subtitle:
coverImageURL.coverImageOptions:
tags:
  -
---

```

### Advanced Templates

This operation is similar to "Basic Hashnode Blog Template", but it allows users to apply more complete payload required for POST Call [hashnode publishPost mutation payload](https://apidocs.hashnode.com/#definition-PublishPostInput)

## Contributing to Hash-Dian

We welcome contributions from everyone! We believe that our project is only as strong as our community. Here are some ways you can contribute to the Hash-Dian project:

### Step 1: Fork the Repository

Before you start contributing, you'll need to fork the repository. This creates a copy of the repository in your GitHub account. Once you've done that, clone the repository to your local machine:

```bash
git clone https://github.com/YOUR_USERNAME/hash-dian.git
```

Replace `YOUR_USERNAME` with your GitHub username.

### Step 2: Set Up Your Development Environment

Once you've cloned the repository, navigate into the project directory and install the dependencies:

```bash
cd hash-dian
npm install
```

This will install all the necessary dependencies for the project.

### Step 3: Make Your Changes

Now you're ready to start making changes. Create a new branch for your feature or bugfix:

```bash
git checkout -b my-feature-branch
```

Replace `my-feature-branch` with a descriptive name for your branch. This keeps your changes organized and separates them from the main project.

Make your changes in this branch, then commit them:

```bash
git add .
git commit -m "Add my feature"
```

Again, replace `"Add my feature"` with a meaningful commit message that describes your changes.

### Step 4: Push Your Changes

After committing your changes, push them to your GitHub repository:

```bash
git push origin my-feature-branch
```

Replace `my-feature-branch` with the name of your branch.

### Step 5: Open a Pull Request

Go to your repository on GitHub and click on the "New Pull Request" button. Select your feature branch as the source, and the main branch as the destination. Then, describe your changes and submit the pull request.

### Other Ways to Contribute

Contributions aren't limited to code. You can also contribute by:

- Reporting bugs
- Suggesting new features
- Improving documentation
- Reviewing pull requests

We appreciate all types of contributions and we're here to help you get started.
