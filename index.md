---
layout: default
title: Foundations of Computational Linguistics
---

# Chapters
{% assign sorted_pages = site.pages | sort:"name" %}
{% for p in sorted_pages %}
    {% if p.layout == 'chapter' %}
- [{{ p.title }}]({{ site.baseurl }}{{ p.url }})<br>
    <em>{{ p.description }}</em>
    {% endif %}
{% endfor %}
