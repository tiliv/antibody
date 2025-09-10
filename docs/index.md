---
layout: one-message
index: true
priority: 1.0  # minor: sitemap scan priority
---

<section id="readme" class="content" markdown="1">
{{ site.civic_readme }}
</section>

{% assign authors = site.pages
  | where_exp:"p","p.author"
  | where_exp:"p","p.index != false"
  | map: "author"
  | uniq %}
<section id="authors">
{% for author in authors %}
  {% assign emails = site.pages
    | where_exp:"p","p.author_email"
    | where_exp:"p","p.author == author"
    | map: "author_email"
    | uniq %}

  <section id="{{ author | slugify }}">
    <h2>{{ author }}</h2>
    <div class="contacts">
      {% for email in emails %}
        <a href="mailto:{{ email }}">@{{ email | split: "@" | reverse | first }}</a>
      {% endfor %}
    </div>
    <div class="piece-list">

      {%- assign journal = site.pages
        | where_exp: "p", "p.layout == 'journal'"
        | where_exp: "p", "p.author == author"
        | where_exp: "p", "p.public"
        | where_exp: "p", "p.published" -%}

      {%- assign noting = site.pages
        | where_exp: "p", "p.layout == 'noting'"
        | where_exp: "p", "p.author == author"
        | where_exp: "p", "p.public"
        | where_exp: "p", "p.published" -%}

      <div data-kind="journal" markdown="1">
        {%- assign ranked = journal | sort: "date" | sort: "rank" -%}
        {%- for piece in ranked -%}
          {%- include piece.html piece=piece -%}
        {%- endfor -%}
      </div>
      <div data-kind="noting" markdown="1">
        {%- assign ranked = noting | sort: "date" | sort: "rank" -%}
        {%- for piece in ranked -%}
          {%- include piece.html piece=piece -%}
        {%- endfor -%}
      </div>

    </div>
  </section>

{% endfor %}
</section>
