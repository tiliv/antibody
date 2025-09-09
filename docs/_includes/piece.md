<div class="history-piece">
  <div class="change-stack">
    <code class="date">
      <time datetime="{{ piece.date | date_to_xmlschema }}">{{ piece.date | date: "%y-W%V" }}</time>
    </code>
  </div>

  <div>
    <h3 class="journal-font">
      <a href="{{ piece.url }}">{{ piece.title }}</a>
    </h3>
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
  </div>
</div>
