---
layout: one-message
---

## LICENSE.md
{: .journal-font}

<section id="readme" class="content" markdown="1">
{{ site.civic_license }}
{%- comment -%}
{% assign authors = site.pages
  | where_exp:"p","p.author"
  | where_exp:"p","p.index != false"
  | map: "author"
  | uniq -%}
{% for author in authors %}
- {{ author }}{% endfor %}
{%- endcomment -%}
</section>
