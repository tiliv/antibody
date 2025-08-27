---
layout: one-message
---

{% assign journal = site.pages | where_exp: "doc", "doc.public == true" %}

{% for piece in journal %}
{% include piece.html piece=piece %}
{% endfor %}
