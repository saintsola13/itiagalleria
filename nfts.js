const NFTS = (function(){
  const W='/assets/gallery/';
  const C = `w1|Iris Hill|w:iris-hill.jpg|235,230,228
w2|Laura See The Future|w:laura-see-the-future.jpg|228,230,235
w3|Paranoia|w:paranoia.jpg|230,228,235
w4|Saw The Fire|w:saw-the-fire.png|235,225,220
1|Staredown|/assets/gallery/og/og1.jpg|196,193,207
2|Beam me up|/assets/gallery/og/og2.jpg|202,191,198
3|Breakdown|/assets/gallery/og/og3.jpg|209,205,201
4|Bubble eye|/assets/gallery/og/og4.jpg|216,193,202
5|Can't change the roots|/assets/gallery/og/og5.jpg|222,214,179
6|Controlled insanity|/assets/gallery/og/og6.jpg|192,208,220
7|Another perspective|/assets/gallery/og/og7.png|196,195,207
8|Going for a long walk|/assets/gallery/og/og8.jpg|202,195,215
9|Dark meadow|/assets/gallery/og/og9.jpg|200,183,182
10|Eye in the sky|/assets/gallery/og/og10.jpg|188,194,211
11|Black kitty|/assets/gallery/og/og11.jpg|203,176,187
12|Hungry Virus|/assets/gallery/og/og12.jpg|208,186,204
13|Crop hustle|/assets/gallery/og/og13.jpg|194,197,193
14|Cloudy knowledge|/assets/gallery/og/og14.jpg|190,206,217
15|Utopia|/assets/gallery/og/og15.jpg|218,202,208
16|Welfare|/assets/gallery/og/og16.jpg|213,198,221
17|Beyond the screen|/assets/gallery/og/og17.jpg|180,179,213
18|Pastelized|/assets/gallery/og/og18.jpg|198,209,215
19|Existence|/assets/gallery/og/og19.jpg|189,207,223
20|Mind explosion|/assets/gallery/og/og20.jpg|212,221,219
21|Apologize|/assets/gallery/og/og21.jpg|220,216,227
22|Stranger kites|/assets/gallery/og/og22.jpg|189,192,215
23|Peace|/assets/gallery/og/og23.jpg|195,189,207
24|Zoom|/assets/gallery/og/og24.jpg|225,208,200
25|Paranoia|/assets/gallery/og/og25.jpg|197,213,237
26|Sky is the limit|/assets/gallery/og/og26.jpg|190,205,217
27|What?|/assets/gallery/og/og27.jpg|191,191,224
28|Way Home|/assets/gallery/og/og28.jpg|189,209,191
29|Actions, not words|/assets/gallery/og/og29.png|215,214,198
30|Suits|/assets/gallery/og/og30.jpg|206,203,212
31|Next|/assets/gallery/og/og31.jpg|176,175,219
32|Melting Pot|/assets/gallery/og/og32.jpg|221,214,203
33|United|/assets/gallery/og/og33.jpg|198,199,193
34|Shadow of mine|/assets/gallery/og/og34.jpg|196,203,213
35|Beatle|/assets/gallery/og/og35.png|219,210,198
36|Break my soul|/assets/gallery/og/og36.png|198,190,193
37|Twoface|/assets/gallery/og/og37.jpg|198,191,207
38|Toxic|/assets/gallery/og/og38.png|193,186,197
39|Rosary|/assets/gallery/og/og39.png|231,198,193
40|The Watchfull Cyclopean|/assets/gallery/og/og40.jpg|199,197,218
41|Someday|/assets/gallery/og/og41.jpg|194,202,204
42|Luminara|/assets/gallery/og/og42.png|199,187,220
43|The other side|/assets/gallery/og/og43.jpg|190,186,208
44|Red velvet|/assets/gallery/og/og44.jpg|195,193,206
45|I Miss You|/assets/gallery/og/og45.jpg|206,194,184
47|Toxic River|/assets/gallery/og/og47.png|174,192,226
48|Holographic Kissed|/assets/gallery/og/og48.jpg|206,209,215
49|Mindblowing|/assets/gallery/og/og49.png|188,176,213
51|Garden Eden|/assets/gallery/og/og51.jpg|186,187,207
52|The Leader|/assets/gallery/og/og52.jpg|186,189,193
53|Solid|/assets/gallery/og/og53.png|195,180,186
54|Skyline|/assets/gallery/og/og54.jpg|191,185,209
55|Bright Beauty|/assets/gallery/og/og55.jpg|224,218,231
56|Romeo|/assets/gallery/og/og56.jpg|200,182,195
57|Professor|/assets/gallery/og/og57.png|199,204,209
58|Why?|/assets/gallery/og/og58.jpg|179,195,212
59|Bubble Fusion|/assets/gallery/og/og59.png|209,204,219
60|Wonderland|/assets/gallery/og/og60.jpg|202,199,204
61|Bonded|/assets/gallery/og/og61.jpg|187,197,199
62|Life Goes On|/assets/gallery/og/og62.jpg|210,175,187
63|Spit It Out|/assets/gallery/og/og63.png|190,186,211
64|Destruction|/assets/gallery/og/og64.png|212,192,188
65|No Plan B|/assets/gallery/og/og65.jpg|212,202,197
66|Trapped In The Bubble|/assets/gallery/og/og66.png|203,203,218
67|Saw The Fire|/assets/gallery/og/og67.png|202,189,204
68|Wonderland|/assets/gallery/og/og68.jpg|202,199,204
69|Headshot|/assets/gallery/og/og69.png|185,190,229
70|Too Cool|/assets/gallery/og/og70.jpg|207,174,186
71|Sense Of Belonging|/assets/gallery/og/og71.png|180,192,202
72|Aquarell|/assets/gallery/og/og72.jpg|202,208,207
73|Soulfire|/assets/gallery/og/og73.png|203,193,188
74|Mystic Lake|/assets/gallery/og/og74.jpg|178,183,203
75|Tired|/assets/gallery/og/og75.jpg|217,220,243
76|Cyberphobia|/assets/gallery/og/og76.jpg|189,176,188
77|See The Future|/assets/gallery/og/og77.jpg|199,195,194
78|Sage|/assets/gallery/og/og78.jpg|199,187,209
79|Cyberpink|/assets/gallery/og/og79.jpg|210,203,226
80|Forgotten|/assets/gallery/og/og80.png|185,194,207
81|Dragon Soul|/assets/gallery/og/og81.png|212,185,188
82|Fractional|/assets/gallery/og/og82.jpg|187,188,188
83|Man In The Mirror|/assets/gallery/og/og83.jpg|187,194,197
84|Passion|/assets/gallery/og/og84.jpg|203,179,186
85|Pose|/assets/gallery/og/og85.jpg|186,195,194
86|Overthinker|/assets/gallery/og/og86.png|200,197,211
87|Every Drop Of Me|/assets/gallery/og/og87.jpg|199,200,208
88|Iris Hill|/assets/gallery/og/og88.jpg|184,192,209
89|Belife|/assets/gallery/og/og89.jpg|214,195,214
90|The Waiter|/assets/gallery/og/og90.jpg|192,207,203
91|Spotlight|/assets/gallery/og/og91.png|189,186,219
92|Nothing Matters|/assets/gallery/og/og92.jpg|203,185,187
93|Control|/assets/gallery/og/og93.png|185,182,227
95|Aristocracy|/assets/gallery/og/og95.jpg|190,195,211
96|Here For You|/assets/gallery/og/og96.jpg|178,182,180
97|Couple Chaos|/assets/gallery/og/og97.png|189,189,199
99|Addicted To You|/assets/gallery/og/og99.jpg|211,206,234
100|Feel the Presence|/assets/gallery/og/og100.jpg|184,198,185
101|Volatility|/assets/gallery/og/og101.png|199,188,198
102|Fluffy Mission|/assets/gallery/og/og102.jpg|193,193,199
103|Soultaker|/assets/gallery/og/og103.png|193,179,221
104|Blue Horizon|/assets/gallery/og/og104.jpg|183,197,224
105|Love And Death|/assets/gallery/og/og105.png|200,187,189
106|Overthinked|/assets/gallery/og/og106.jpg|177,186,195
107|Endless Stare|/assets/gallery/og/og107.jpg|194,183,210
108|Flower Power|/assets/gallery/og/og108.jpg|218,210,207
109|Soullake|/assets/gallery/og/og109.jpg|203,194,219
110|Something Behind|/assets/gallery/og/og110.png|187,193,212
111|The Rise|/assets/gallery/og/og111.png|179,186,210
112|Bloody Sky|/assets/gallery/og/og112.jpg|194,190,192
113|Innocent Love|/assets/gallery/og/og113.jpg|193,178,200
114|Who Am I|/assets/gallery/og/og114.png|187,191,219
115|Dazzle|/assets/gallery/og/og115.jpg|207,205,205
116|Belle|/assets/gallery/og/og116.png|191,200,230
117|Split|/assets/gallery/og/og117.png|195,192,220
118|Not Interested|/assets/gallery/og/og118.jpg|196,186,204
119|Drawn Together|/assets/gallery/og/og119.png|201,199,218
120|Fake Love|/assets/gallery/og/og120.png|186,190,200
121|Inspiration|/assets/gallery/og/og121.jpg|200,189,203
122|Stepped Away|/assets/gallery/og/og122.jpg|183,189,222
123|Bacillus|/assets/gallery/og/og123.png|197,195,209
124|Edge Of Time|/assets/gallery/og/og124.jpg|189,187,208
125|Iridescent|/assets/gallery/og/og125.png|200,199,204
126|Mind Orbit|/assets/gallery/og/og126.png|200,188,214
127|Fluorescat|/assets/gallery/og/og127.png|186,187,184
128|Overprotection|/assets/gallery/og/og128.png|202,206,227
129|Highly Connected|/assets/gallery/og/og129.png|189,186,222
130|Empty Wideness|/assets/gallery/og/og130.jpg|184,187,197
131|Bloody Taste|/assets/gallery/og/og131.png|205,201,208
132|Beauty In Chaos|/assets/gallery/og/og132.jpg|180,184,200
133|Reality Check|/assets/gallery/og/og133.jpg|181,195,198
134|Angels In My Mind|/assets/gallery/og/og134.png|181,179,213
135|Floral Fantasy|/assets/gallery/og/og135.jpg|196,192,195
136|Rising Star|/assets/gallery/og/og136.png|204,195,200
137|Think About Robin|/assets/gallery/og/og137.jpg|213,208,178
138|What Are You Hiding|/assets/gallery/og/og138.png|201,183,201
139|Roots Of Imagination|/assets/gallery/og/og139.jpg|192,189,188
140|Feel The Force|/assets/gallery/og/og140.png|192,180,223
141|Plant Your Deeams|/assets/gallery/og/og141.jpg|219,205,211
142|The Last Step|/assets/gallery/og/og142.jpg|183,193,204
143|Fade Away|/assets/gallery/og/og143.png|197,197,211
144|Involuntary Transformation|/assets/gallery/og/og144.png|208,187,215
145|Rainbow Kissed|/assets/gallery/og/og145.png|207,205,221
146|Cozy Cup|/assets/gallery/og/og146.jpg|198,199,209
147|Little Touch Of Self-Awareness|/assets/gallery/og/og147.png|206,198,223
149|Always Behind You|/assets/gallery/og/og149.png|203,182,195
150|Quiet Stand|/assets/gallery/og/og150.png|212,209,200
151|The Horror Of Truth|/assets/gallery/og/og151.png|183,196,197
152|Embers Behind The Mask|/assets/gallery/og/og152.png|196,194,190
153|Breath It Out|/assets/gallery/og/og153.png|199,190,201
154|Neon Moonrise Reverie|/assets/gallery/og/og154.png|214,214,227
155|When Shadows Speak Soft|/assets/gallery/og/og155.png|181,183,192
156|Digital Solitude|/assets/gallery/og/og156.png|203,183,208
157|Cosmic Becoming|/assets/gallery/og/og157.png|183,195,201
158|The Weight Of Dissolving Identity|/assets/gallery/og/og158.png|191,205,223
159|Ultraviolet Muse|/assets/gallery/og/og159.png|192,201,228
160|Blooming In The Quiet|/assets/gallery/og/og160.png|193,196,228
161|Where The Mind Outgrows The Body|/assets/gallery/og/og161.png|196,210,220
162|Electric Vigil|/assets/gallery/og/og162.png|174,174,209
163|What Fire Leaves Behind|/assets/gallery/og/og163.jpg|196,192,200
164|Wires Of Solitude|/assets/gallery/og/og164.jpg|200,190,208
165|Ecliptic|/assets/gallery/og/og165.png|184,190,207
166|Between Seeing And Knowing|/assets/gallery/og/og166.png|200,201,188
167|Eternal Embers Of Silence|/assets/gallery/og/og167.png|182,180,179
168|Silent Molt|/assets/gallery/og/og168.jpg|232,191,187
169|Fragmented Continuum|/assets/gallery/og/og169.png|179,183,195
170|The Threshold|/assets/gallery/og/og170.png|186,173,186
171|Under Pressure|/assets/gallery/og/og171.png|197,195,193
173|The Price Of Vision|/assets/gallery/og/og173.png|191,191,195
174|Finde The Light|/assets/gallery/og/og174.png|179,182,188
175|Born Of Soil And Thought|/assets/gallery/og/og175.png|204,201,208
176|Oracle Of The Deep|/assets/gallery/og/og176.png|181,179,175
177|Beyond Today|/assets/gallery/og/og177.png|184,200,209
178|Shared Silence|/assets/gallery/og/og178.png|206,206,227
179|Unfolding Self|/assets/gallery/og/og179.png|189,189,187
180|Where Identity Bleeds|/assets/gallery/og/og180.png|183,197,209
181|Silent Mind Echoes|/assets/gallery/og/og181.png|183,188,196
183|When The Cosmos Looks Back|/assets/gallery/og/og183.png|187,175,181
184|Liquid Echoes Of Self|/assets/gallery/og/og184.png|207,189,214
185|Open Wait|/assets/gallery/og/og185.png|209,204,209
186|Defiance Of The Gaze|/assets/gallery/og/og186.png|193,193,211
187|Rooted In Absence|/assets/gallery/og/og187.png|178,192,210
188|Devotion|/assets/gallery/og/og188.png|198,187,191
191|Waves Of Identity|/assets/gallery/og/og191.png|191,184,203
192|Sweet Poison|/assets/gallery/og/og192.png|212,206,200
193|Shadows Under Skin|/assets/gallery/og/og193.png|207,191,176
194|Catching Tomorrow|/assets/gallery/og/og194.png|189,187,218
195|Blind Devotion|/assets/gallery/og/og195.png|213,210,205
196|River Of Thought|/assets/gallery/og/og196.png|179,190,211
197|Eclipsed Neon Deity|/assets/gallery/og/og197.png|185,192,220
198|City Of Silent Souls|/assets/gallery/og/og198.png|187,196,198
199|Just Enough Light|/assets/gallery/og/og199.png|179,179,179
200|Electric Fury|/assets/gallery/og/og200.png|174,178,200
202|Neon Ascension|/assets/gallery/og/og202.jpg|203,200,208
203|Shepherd Of The Hidden Grove|/assets/gallery/og/og203.png|200,193,181
204|Verdant Eclipse|/assets/gallery/og/og204.png|178,181,206
205|Abyss Of Witnesses|/assets/gallery/og/og205.png|195,193,193
206|Sylvan Mindscape|/assets/gallery/og/og206.png|198,213,221
207|Neon Remnants|/assets/gallery/og/og207.png|179,179,203
208|Moonflower Silence|/assets/gallery/og/og208.png|195,185,185
209|Silent Dusk|/assets/gallery/og/og209.png|180,183,213
210|Edge of Becoming|/assets/gallery/og/og210.png|202,195,195
211|Restless Mind|/assets/gallery/og/og211.png|179,191,217
212|Don't Think|/assets/gallery/og/og212.png|196,196,196
213|The Green Dawn|/assets/gallery/og/og213.png|190,196,176
214|Electric Quietude|/assets/gallery/og/og214.png|195,198,217
216|Halo Of Decay|/assets/gallery/og/og216.png|188,181,196
217|Velvet Abyss|/assets/gallery/og/og217.png|196,194,217
218|Ember's Whisper|/assets/gallery/og/og218.png|219,173,173
219|Chromatic Reverie|/assets/gallery/og/og219.jpg|181,184,210
220|Faceless Horizon|/assets/gallery/og/og220.png|188,192,192
221|What Just Happened?|/assets/gallery/og/og221.jpg|186,174,175
222|Take Me In|/assets/gallery/og/og222.jpg|179,181,239
223|We Can Feel It|/assets/gallery/og/og223.png|186,193,213
224|Beneath The Burning Sky|/assets/gallery/og/og224.png|185,187,190
225|Secrets Behind|/assets/gallery/og/og225.jpg|197,181,180
226|Anonymous Hope|/assets/gallery/og/og226.png|174,176,238
227|Between Peace And Chaos|/assets/gallery/og/og227.png|203,181,214
228|Duality In Silence|/assets/gallery/og/og228.png|188,175,183
229|Burden Of The Skies|/assets/gallery/og/og229.png|204,198,195
230|Out Of The Box|/assets/gallery/og/og230.png|189,189,189
231|309 Feathers Of Oblivion|/assets/gallery/og/og231.jpg|192,177,208
232|The Garden's Muse|/assets/gallery/og/og232.png|209,201,203
233|The Fallen Kingdom|/assets/gallery/og/og233.png|187,196,210
234|Fantasy Drive|/assets/gallery/og/og234.png|187,182,202
235|Divided Mind|/assets/gallery/og/og235.png|193,192,188
236|The Last Moment|/assets/gallery/og/og236.jpg|208,218,187
237|Prison Of Quite Waters|/assets/gallery/og/og237.jpg|194,220,214
238|Prism Soul|/assets/gallery/og/og238.png|198,191,196
239|The Crowd Inside|/assets/gallery/og/og239.png|206,190,195
240|Unspoken Wings|/assets/gallery/og/og240.png|205,201,214
241|Fallout Of Yesterday|/assets/gallery/og/og241.png|213,190,209
242|Mind Of Color|/assets/gallery/og/og242.png|209,205,211
243|Silent Reflection|/assets/gallery/og/og243.png|197,196,216
244|Wreck Of Our Tomorrow|/assets/gallery/og/og244.png|194,198,199
245|Corporate Dreams|/assets/gallery/og/og245.png|219,208,193
246|Shape Of The Unspoken|/assets/gallery/og/og246.png|181,182,196
247|Between Reality And Imagination|/assets/gallery/og/og247.png|203,189,213
248|Two Selves|/assets/gallery/og/og248.png|189,188,190
249|Raised Between Legends|/assets/gallery/og/og249.png|179,186,192
250|Synthetic Light|/assets/gallery/og/og250.png|175,186,207
251|Voice Of The Shadow|/assets/gallery/og/og251.png|188,190,202
252|Last Witness|/assets/gallery/og/og252.jpg|185,181,181
253|Fire Of Creation|/assets/gallery/og/og253.png|190,186,211
254|Rising Thought|/assets/gallery/og/og254.png|203,203,203
255|The Astral Connoisseur|/assets/gallery/og/og255.png|186,183,188
256|Silence In Command|/assets/gallery/og/og256.png|208,184,186
257|Rebellion Behind The Mask|/assets/gallery/og/og257.png|192,189,184`;
  return C.trim().split('\n').map(line=>{
    const [id,name,img,bg]=line.split('|');
    let url=img;
    if(img.startsWith('w:')) url=W+img.slice(2);
    return {id: isNaN(id)?id:Number(id), name, img:url, bg:bg.split(',').map(Number)};
  });
})();
