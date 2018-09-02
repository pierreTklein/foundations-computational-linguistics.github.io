---
layout: default
title: Computational Phonology and Morphology
---

<div class="main">
  <h1>Computational Phonology and Morphology</h1>
  <span class="authors">Timothy J. O'Donnell and Adam Albright</span>
</div>

### Chapters
{% assign sorted_pages = site.pages | sort:"name" %}
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
- [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}
