[![Hippocratic License HL3-BDS-MEDIA-SUP-SV](https://img.shields.io/static/v1?label=Hippocratic%20License&message=HL3-BDS-MEDIA-SUP-SV&labelColor=5e2751&color=2a6a65)](https://firstdonoharm.dev/version/3/0/bds-media-sup-sv.html)

You may reproduce this code, text and license, only if you attribute yourself as the author.

# Fort Collins Civic Node: ANTIBODY

This is an open-source publication of local-made journalism.

News media will waste our time; Their nutrition is secured through our attention, and our data. They have had it all, but cannot hear us.

We assert that there are degrees of information quality, that we must not struggle to distinguish them and that they are these: 1) First-party claims with metadata, 2) Hearsay and 3) Fraud.

It is necessary for our social cohesion that we possess various ways and means of direct information exchange within our cities. Our Domestic Enemies have taken our placation as given, however We the People have acquired on our own several talents and skills to deploy in our defense.

## This Repository

Notes, sources, contributions, discussion, revisions and general accountability can be observed in our work; This is not a statement of purity, but of intent. You may not be surprised that nothing like this exists for your local news, but you possess the skills to do better.

Our work will be timestamped, annotated and organized. The publication's brand details are extracted to a configuration, CNAME and the README material.

We provide basic non-vendor Javascript to support display and interaction for embedded first-party images and audio. You are capable of hosting your own primary sourcing while minimizing gratuitous reliance on third parties to handle our data. We're beholden to GitHub, but you may choose any git service, or your own private one, if you can host the output of a build found in the `docs/_site` folder. We will continue to evolve the tools we have, guided by minimalism for the parts of sites that require graceful usability that AI agents are not yet providing, or which can't be easily prompted for.

If you use assistive technology like AI agents to help you work, you can modify the AGENTS.md to put your preferred agent in a proper state of mind for working on your behalf.

You have access to all the tools GitHub documents, and you have AI agents to assist you. AI is a complex subject touching energy, geopolitics, copyright, regulation, privacy and more. Energy will be supplied to make AI remain and many will tune AI to reduce its demands; Do not forego your local independent voice for fear of contributing. Become empowered, and converse with AI agents to learn what they know about programming. In conversing, they can help you learn.

If you copy, fork, or start your own repository with the template, you can operate it freely under the terms of the included license. We're allowing it all but the Hippocratic License 3, with modules and our included stipulations, makes clear the shape of our intent: Do not act like a Domestic Enemy. If you make a clone of this without the license, pick your own oath and speak.

## This Site

We compile a static site from these sources and host it with included GitHub Pages and free Cloudflare usage.

_Antibody_, calling itself a Fort Collins Civic Node, is a demonstration that you have powers of communication without using brands as the verbs so easily to search or filter. We encourage our community and others nearby to find reasons: 1) To communicate on our own; 2) To do it without moderation by Privilege-protected positions above us; 3) To speak about what you want more of locally.

Copies of this site are unremarkable in form, but their function is anything you want. There is no "back-end" to manage for private processing or to be hacked. The whole thing is open source anyway. Your content does not need protection from being stolen, it needs authenticity so that it cannot be plausibly stolen. The site is just files you could host anywhere, and could further process into non-Pages hosts. It leaves all web decisions to you, including Antibody's minimalist templates to reference, and allows you to grow if you find the need.

Your domain name will relate to your GitHub username and publication project name. You can assign your own domain to it any way you want, but you will have to buy that for yourself and tell GitHub pages.

Configure Cloudflare's free individual service for the URL you use and let it run your DNS. A GitHub Pages domain should disable the Proxied connection type for the DNS record. This is a well-documented path for GitHub Pages users.

## These Pieces

We must observe the many ways in which companies and sometimes individuals are failing us, not to make them our villains but to demonstrate the scale of our collective loss of control. Remember not the names, but the behavior. We hate the game, if you will. We hate that it only takes naming any player to show it.

In our world building itself on data taxation, Privacy must not be the illusion it is today. Law enforcement need not even follow legal channels to acquire our data if the same can be purchased outright or stolen.

As fluidly as companies update their Terms, governments are too. Antibody thinks you should be writing your Terms too. Let's collaborate here and elsewhere.

# Development

Use Ruby's `bundle` runner to ask `jekyll` to `serve`. This will start a preview server that handles recompiling the site after edits to source files. Some changes, like inside `_config.yml`, need to have a full server stop and restart before the preview site can detect the difference.

We will improve upon this entry point so that explanation is not needed:

```shell
cd antibody/docs
bundle exec jekyll serve
```

## Adding journalism to Antibody

1. Create a folder inside `docs/journal/`
2. Adjust its name to reflect the piece's public URL (called the "slug" for reasons you can freely read about).
3. If you have images or audio to present, you will also add an `exhibits` folder inside of that.
3. Create a file `index.md` just inside your URL folder. The top section of data is not published with the final site, but can be deliberately used to display things in the template.
4. The required fields `layout` and `published` make it possible to preview the page in its current form. `public` will link it from the main page.
5. After committing your own changes to a local feature branch, start a GitHub Pull Request.


This is an example piece's `docs/journal/your-name-Your-Subject/index.md` template for examples:
```yaml
---
# This section uses Yaml format, which is like austere JSON.
date: 2025-08-23  # optional, the work's attributable date
rank: 3  # optional, section group for use on mixed pages, see docs/index.md

title: Your title  # used for the browser's page title, and listing the piece
author: Your Name  # used for contact card
author_email: your.email@example.com  # used for contact card
contact_subject: "Email subject line"  # optional, used for author email on this piece
tags: [wip]  # optional, grouping terms

layout: noting  # "noting", "journal" and "one-message" are viable layouts.
published: true  # included in final site (works whether or not `public`)
public: false  # has visibility on our front page (needs `published`)
index: false  # has visibility on search engines (needs `published`)
---

Line one begins now. This is a small format demonstration, but you should
arrange things however you like. You can write on long lines with word wrap, or
use linebreaks (no gaps or indentation) to continue in a paragraph.

The gaps are what make paragraphs in the final result.

1. Lists are their own grouped concept
2. So treat them like a paragraph's lower neighbor
3. The margin gap following a list is larger than the top.

The pair of matching `---` `---` lines above the markdown will keep any metadata
you need. You can make up your own extras, per document. The combined information
there is called the page's front-matter. It is visible during static site builds
but does nothing unless some page or layout code uses it as a display, like
`{{ page.yourSetting }}`, or in a supported loop, etc. It will not be inspectable
on the final released site unless used.

### Major header

#### Minor header

**The first bold range** in a paragraph is transformed to header font.
The **rest** remain in the article font.

Normally each blank line signals a paragraph break.

If you are using `noting` or `journal` layouts, the CSS for `#layout` supports a
"left" and "right" column. Using the `side` class marks it for staying inline on
narrow screens, but escaping to the declared side when there's horizontal space.

Figures become clickable to open a same-page view of the raw file and caption.
Audio exhibits will be enabled soon for cache-friendly streaming of long sources,
using similar methods with section navigation.

<figure class="side left">
  <img
    src="./exhibits/KB-auth-personalized_plus_program.png"
    alt="Screenshot of a knowledge base search lacking relevant results"
  >
  <figcaption markdown="1">If you want markdown in this caption,
also use the attribute as shown. Otherwise, no `markdown` attribute
is required.</figcaption>
</figure>

You can also use tags like `<aside>` or `<iframe>` with the side classes. If you
use HTML, the site will stop expecting markdown format unless you bring it back
with a `markdown="1"` attribute. Avoid indenting markdown text if you use
multiple lines.
```
