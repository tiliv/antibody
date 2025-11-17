{%- if page.re -%}
{%- assign domain = page.re | antibody_domain -%}
[Re: {{ domain }}]({{ page.re }})
{% endif %}
* (dynamic)
{:toc}
