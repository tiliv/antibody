---
layout: sitemap
index: true
title: Root
note: This must render as valid xml via the layout.
---
<table>
  <tr>
    <th>URL</th>
    <th>Last Modified</th>
  </tr>
  <xsl:for-each select="//s:sitemap">
    <tr>
      <td><a href="{s:loc}"><xsl:value-of select="s:loc"/></a></td>
      <td><xsl:value-of select="s:lastmod"/></td>
    </tr>
  </xsl:for-each>
</table>
