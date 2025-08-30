---
layout: one-message
index: true
---

{% assign journal_public = site.pages | where_exp: "doc", "doc.public == true" %}
{% assign journal_published = journal_public | sort: "date" %}
{% assign journal_ranked = journal_public | sort: "rank" %}

<section id="readme" class="content">
{{ site.civic_readme | markdownify }}
</section>

{% for piece in journal_ranked %}
{% include piece.html piece=piece %}
{% endfor %}
