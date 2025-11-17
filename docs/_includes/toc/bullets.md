{%- if page.re -%}
{%- assign domain = page.re | replace: 'https://', '' | replace: 'http://', '' | split: '/' | first -%}
[Re: {{ domain }}]({{ page.re }})
{% endif %}
* (dynamic)
{:toc}
