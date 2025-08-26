---
layout: one-message
---

{% assign published = site.articles | where_exp: "d", "d.published != false" %}

{% for article in published %}
## [{{ article.title }}]({{ article.url }})
{:.journal-font}

{% endfor %}
