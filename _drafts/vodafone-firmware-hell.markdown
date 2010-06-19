---
layout: post
title: Vodafone firmware hell
tags: howto
---

Today I spent several hours trying to rid my phone (a Sony Ericsson W810i) from
the awful firmware Vodaphone insisted to put on it. It turns out that it is a
lot harder than I had imagined. They really don't want you to do this!

My first try was to use the Sony Ericsson Update Service to simply reinstall
the firmware. This does not work. Apparently the firmware is versioned
according to the different brands and zones the phone is targted at. This
version number is called CDA and in my case the horrible firmware as more
specifically known as CDA102494/47 ( You can find this out by pressing
&rarr;\*&larr;&larr;\*&larr;\* ). Judging by the [extensive] [lists] of CDAs
for this phone I guess the version I want to have is CDA102555/13.

[extensive]: http://www.topsony.com/forum/cmps_index.php?page=CDA_w810
[lists]: http://www.expansys-usa.com/ft.aspx?k=67416


Finding out the exact firmware to install is just the beginning though. The
next step is to assemble the software needed to actuall install it. Apparently
you need a combination of some, very unofficial, programs to pull this of.
* SEMC USB Flash Driver. This is apparently installed by SEUS but [one site] warns that this may result in the CID (more on this below) being upgraded.
* [XS++] 
* [SETool2 Lite]

[one site]: http://www.akshayy.com/sonyericsson/tutorials/installing-usb-flash-drivers/
[XS++]: http://forums.se-nse.net/topic/16338-xs-v31-darwin/
[SETool2 Lite]: http://forums.se-nse.net/topic/13115-setool2-lite/
