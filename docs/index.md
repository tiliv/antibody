---
layout: one-message
index: true
priority: 1.0  # minor: sitemap scan priority
---

{% assign journal_public = site.pages | where_exp: "doc", "doc.public == true" %}
{% assign journal_published = journal_public | sort: "date" %}
{% assign journal_ranked = journal_published | sort: "rank" %}

<section id="readme" class="content" markdown="1">
{{ site.civic_readme }}
</section>

{% for piece in journal_ranked %}
{% include piece.md piece=piece %}
{% endfor %}
