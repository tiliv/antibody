---
layout: one-message
index: true
---

{% assign journal = site.pages | where_exp: "doc", "doc.public == true" %}

<section id="readme" class="content">
{{ site.civic_readme | markdownify }}
</section>

{% for piece in journal %}
{% include piece.html piece=piece %}
{% endfor %}
