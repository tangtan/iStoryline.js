# iStoryline.js

<p align="left">
    <a href='#'><img src='https://travis-ci.org/meolu/walle-web.svg?branch=master' alt="Build Status"></a>  
    <a href='#'><img src='https://badges.gitter.im/Join%20Chat.svg'></a>
</p>

iStoryline.js is a JavaScript library for producing storyline visualizations with diverse sketchy styles. [Storyline visualization](https://xkcd.com/657/) is a fancy way to tell a story. Lines represent characters in the story. This fancy visualization naturally has some advantages in explaining the story:

* The undulations of the lines can vividly represent the evolution of the plot.
* The interval between the lines can also display the relation of the characters in a concise and quick manner. 

The abundant messages of the textual stories are usually hard to be received by appreciators in a short time. As a result, storyline visualizations have become prevalent recently. Many automatic methods have been developed to generate storylines. However, these methods cannot always capture the inherent features of stories (e.g., actor mode, plot evolution). Thus, iStoryline aims to provide various interactions for users to design storyline visualizations with their design talents while minimizing the design efforts through an automatic layout module.

For more information, please check [our paper](http://www.tantang.org/publication/2018_infovis_istoryline/2018_infovis_istoryline.pdf) and the [supplement material](https://istoryline.github.io/).

## Installation

Use the package manager [npm](https://docs.npmjs.com/cli/install) or [yarn](https://yarnpkg.com/lang/en/docs/cli/add/) to install iStoryline.

```Json
npm install https://github.com/tangtan/istoryline.git
```

or

```Json
yarn add https://github.com/tangtan/istoryline.git
```

## Basic Usage

```JavaScript
import iStoryline from "istoryline"
let iStoryliner = new iStoryline();

// generate storyline visualizations from the story script
let storyScriptUrl = './data/Redcap.xml';

// graph can be drawed using any canvas or svg libraries
let graph = iStoryliner.readFile(storyScriptUrl);

// obtain the characters names
console.log(graph.names);  // ['Red cap', 'Mother', 'Wolf', 'GrandMa']

// obtain the paths of the characters
console.log(graph.paths);  // [[[x1, y1], [x2, y2], ...], ...]

// obtain the timeline of the layout
console.log(graph.timeline); // [time => x, ...]
```

### TODO

- provide the drawing APIs based on [canvas](https://www.w3schools.com/html/html5_canvas.asp) or [svg](https://www.w3schools.com/html/html5_svg.asp).

## Interactive Storyline Editor

iStoryline.js provides a build-in editor for producing storyline visualizations.

1. Install Node.js (>= 6.0)
2. Install dependencies `npm i` or `yarn`

3. Start the editor `npm start`

4. Please visit [localhost:8080](http://localhost:8080)

## Documentation

- [Story Script](https://github.com/tangtan/istoryline/wiki/Story-Script)

- [Data Structure and Workflow](https://github.com/tangtan/istoryline/wiki/Data-Structure-and-Workflow)

- [API Reference](https://github.com/tangtan/istoryline/wiki/API-Reference)

## Reference

1. **T. Tang**, S. Rubab, J. Lai, W. Cui, L. Yu, and **Y. Wu**. "iStoryline: Effective Convergence to Hand-drawn Storylines. IEEE Transactions on Visualization and Computer Graphics", 25(1):769-778, 2019.
2. S. Liu, **Y. Wu**, E. Wei, M. Liu, and Y. Liu. "StoryFlow: Tracking the Evolution of Stories. IEEE Transactions on Visualization and Computer Graphics", 19(12):2436–2445, 2013.

## Citation

We appreciate your citation if this library contributes to your work.

```bib
@article{iStoryline2018,
  title = {{iStoryline: Effective Convergence to Hand-drawn Storylines}},
  author = {Tang, Tan and Rubab, Sadia and Lai, Jiewen and Cui, Weiwei and Yu, Lingyun and Wu, Yingcai},
  journal = {IEEE Transactions on Visualization and Computer Graphics},
  volume = {25},
  number = {1},
  pages = {769--778},
  year = {2018},
  publisher = {IEEE}
}
```

## License

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at
    
       http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
