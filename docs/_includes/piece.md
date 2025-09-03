### [{{ piece.title }}]({{ piece.url }})
{:.journal-font}

<aside>
  <code class="date">
    <time datetime="{{ piece.date | date_to_xmlschema }}">{{ piece.date | date: "%G-W%V" }}</time>
  </code>
  {% assign words = piece.content | number_of_words %}
  {% assign minutes = words | divided_by:200 | ceil %}
  <div class="size">
    <strong>{{ words }}w</strong> ;
    <em>{{ minutes }}m</em>
  </div>
  <div style="margin: auto"></div>
  <div class="tags">
    {%- for tag in piece.tags -%}
      <span>{{ tag }}</span>
    {%- endfor -%}
  </div>
</aside>
