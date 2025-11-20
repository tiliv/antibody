---
date: 2025-11-19
rank: 50
title: "NOTING: Adventure Guide"
author: Autumn Ryan
author_email: autumn@discoverywritten.com

tags: [local, guerilla, marketing]

noting: true
public: false
published: true
index: false

ads:
  Blue Pig Gallery:
    url: https://www.thebluepiggallery.com/
    about: |
      Fine art by western Coloradans, art classes, yoga classes.
    links:
      - https://www.thebluepiggallery.com/featured-artists,
      - https://www.thebluepiggallery.com/newsletter
  The Artful Cup:
    url: https://www.thebluepiggallery.com/coffee
    about: |
      The Artful Cup at Blue Pig Gallery is an inspiring place to start your
      morning and energize your afternoon.
    links:
      - https://www.thebluepiggallery.com/featured-artists

---

This piece is about local companies who are marketing inside pamphlets that nobody is looking at. I am helping these businesses spread their business names and links, without compensation or ad spends. I hope to help these businesses notice that the meaning of an ad campaign has nothing to do with social media.

I am using the words they use in these pamphlets, and I am supressing all references to their social media accounts.

{% for ad_pair in page.ads %}
{% assign name=ad_pair[0] %}{% assign ad=ad_pair[1] -%}
**{{ name }}** @ {% include link.html url=ad.url %}: {{ ad.about -}}
{% for link in ad.links -%}
- {% include link.html url=link %}
{%- endfor %}
{% endfor %}
