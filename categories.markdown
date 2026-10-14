---
layout: default
description: "주제별로 모아 본 글 목록이에요."
permalink: /categories/
title: 카테고리
---
<div class="post-container">
  <h1 class="post-title category-title">카테고리</h1>
  {% assign cats = site.categories | sort %}
  <ul class="category-list" style="list-style: none; margin: 0; padding: 0;">
  {% for c in cats %}{% assign s = c[0] | slugify %}<li style="list-style: none;"><a href="{{ '/category/' | append: s | append: '/' | relative_url }}">{{ c[0] }}</a> <span>({{ c[1] | size }})</span></li>
  {% endfor %}</ul>
</div>

<script>
  if (window.innerWidth <= 768) {
    history.scrollRestoration = 'manual';
    window.addEventListener('load', function () {
      document.querySelector('.post-container').scrollIntoView({ block: 'start' });
    });
  }
</script>
