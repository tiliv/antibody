---
layout: one-message
index: true
priority: 1.0  # minor: sitemap scan priority
---

{% include indexed.html %}

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

  {%- assign journal = site.pages
    | where_exp: "p", "p.noting == null"
    | where_exp: "p", "p.author == author"
    | where_exp: "p", "p.public"
    | where_exp: "p", "p.published" -%}

  {%- assign noting = site.pages
    | where_exp: "p", "p.noting == true"
    | where_exp: "p", "p.author == author"
    | where_exp: "p", "p.public"
    | where_exp: "p", "p.published" -%}

  <section id="{{ author | slugify }}">

    <h2>{{ author }}</h2>
    {%- assign total_words = 0 -%}
    {%- for piece in journal -%}
      {%- assign words = piece.content | number_of_words -%}
      {%- assign total_words = total_words | plus: words -%}
    {%- endfor -%}
    <div class="contacts">
      {% for email in emails %}
        <a href="mailto:{{ email }}">@{{ email | split: "@" | reverse | first }}</a>
      {% endfor %}
    </div>
    <div class="size"><strong>{{ total_words }} w</strong></div>
    {%- comment -%} <h3 class="license"><a href="/journal/autumn-ryan/LICENSE">LICENSE.md</a></h3> {%- endcomment -%}

    <div class="piece-list">
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

<section id="license" class="content" markdown="1">
{{ site.civic_license }}
</section>
