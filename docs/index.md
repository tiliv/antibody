---
layout: one-message
index: true
---

{% assign journal_public = site.pages | where_exp: "doc", "doc.public == true" %}
{% assign journal_ordered = journal_public | sort: "rank, date" %}

<section id="readme" class="content">
{{ site.civic_readme | markdownify }}
</section>

{% for piece in journal_ordered %}
{% include piece.html piece=piece %}
{% endfor %}
