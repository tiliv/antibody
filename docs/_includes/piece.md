<div class="history-piece">
  {%- assign history_path = include.piece.path | replace: "/", "" | replace: ".md", "" -%}
  {%- assign history = site.data.git.history[history_path] -%}
  <ol class="change-stack">
    {% for slot in history.histogram %}
      {%- assign bytes_avg = slot.bytes_changes | divided_by: history.meta.unique_weeks -%}
      {%- if bytes_avg < 200 -%}
      {%- if slot.week != history.meta.first_commit.week -%}
      {%- continue -%}
      {%- endif -%}
      {%- endif -%}
      <li class="bar"
          data-week="{{ slot.week }}"
          aria-label="{{ slot.week }}: {{ slot.commits }} commits">
        <code data-type="iso-week">{{ slot.week }}</code>
      </li>
    {% endfor %}
  </ol>

  <div>
    <h3 class="journal-font">
      <a href="{{ include.piece.url }}">{{ include.piece.title }}</a>
    </h3>
    <aside>
      {% assign words = include.piece.content | number_of_words %}
      {% assign minutes = words | divided_by:200 | ceil %}
      <div class="size">
        <strong>{{ words }}w</strong> ;
        <em>{{ minutes }}m</em>
      </div>
      <div class="tags">
        {%- for tag in include.piece.tags -%}
          <span>{{ tag }}</span>
        {%- endfor -%}
      </div>
    </aside>
  </div>
</div>
