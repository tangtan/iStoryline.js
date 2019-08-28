# istoryline-layout.js

This library targets at producing hand-drawn style storyline visualizations.

### Introduction

[Storyline](https://xkcd.com/657/) is a fancy way to tell a story. Lines always represent individual characters or groups in the story. Due to the definition of the storyline, it naturally has some advantages in explaining the story: 
* The undulations of the lines can vividly represent the evolution of the plot.
* The interval between the lines can also display the relation of the characters in a concise and quick manner. 

The abundant messages of the textual stories are usually hard to be received by appreciators in a short time. As a result, storyline visualizations have become more prevalent recently. Many automatic methods have been developed to generate storylines. The rapid generation of storylines has some good results, but failed to capture inherent expressive features of stories.
Thus, the interactions with storylines become necessary. 

In order to create an interactive authoring tool, we designed this algorithm. The algorithm is based on our paper *iStoryline*. It reads data from XML files, and draw the initial layout for storylines. We change the time data into time sequences, and use both a quadratic convex optimization model and a slot model to produce layouts (see Examples).


### Install

1. Install Node.js (>= 6.0)
2. Install dependencies
```
npm install
```

3. Start the application
```
npm start  
```

4. Visit http://localhost:8080

### Examples

* matrix by QP model ![](lrzdoc/Screenshot from 2019-06-02 21-05-56.png)

* matrix by slot model![](lrzdoc/Screenshot from 2019-06-02 21-00-20.png)

#### API

```javascript
render(nodes)
//nodes is a two-dimensional array, which stands for all the lins
//this function will paint lines in the canvas
```

```javascript
readFromXML(xml)
//xml is the data given by d3.xml
//this function will return an object {locationTree,sessionTabel}
```

```javascript
slotInit(graph,data,sequence)
//data.entities contains all the characters' name
//sequence is a array,which contains the key timeframes.
//this function will return a two-dimensional array,and put it in the graph.nodes.
```

### License

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
       http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

### Reference

1. S. Liu, **Y. Wu**, E. Wei, M. Liu, and Y. Liu. StoryFlow: Tracking the Evolution of Stories. IEEE Transactions on Visualization and Computer Graphics, 19(12):2436–2445, 2013.
2. Y. Tanahashi, C. H. Hsueh, and K.L. Ma. An Efficient Framework for Generating Storyline Visualizations from Streaming Data. IEEE Transactions on Visualization and Computer Graphics, 21(6):730–742, 2015.
3. **T. Tang**, S. Rubab, J. Lai, W. Cui, L. Yu, and **Y. Wu**. iStoryline: Effective Convergence to Hand-drawn Storylines. IEEE Transactions on Visualization and Computer Graphics, 25(1):769-778, 2019.
