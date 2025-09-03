### [{{ piece.title }}]({{ piece.url }})
{:.journal-font}

<aside>
  {% assign words = piece.content | number_of_words %}
  {% assign minutes = words | divided_by:200 | ceil %}
  <div class="size">
    <strong>{{ words }}w</strong> ;
    <em>{{ minutes }}m</em>
  </div>
  <div class="tags">
    {%- for tag in piece.tags -%}
      <span>{{ tag }}</span>
    {%- endfor -%}
  </div>
</aside>
