<template>

  <div class="row">
    <div class="flex md6">
      <div class="item">
        <div class="box">
          <va-input v-model="name" placeholder="Name" @keyup.enter="addPerson" style="margin-bottom:5px;" />
          <va-select v-model="nodeType" text-by="title" :options="nodeTypes" placeholder="Type" :searchable="true" />
          <va-button @click="addPerson()" :rounded="false">Create node</va-button>
        </div>
      </div>
    </div>
    <div class="flex md6">
      <div class="item">
        <div class="box">
          {{Array.from(selIds.keys())[0]}}
          <va-select v-model="linkType" text-by="title" :options="linkTypes" placeholder="Type" :searchable="true" /> {{Array.from(selIds.keys())[1]}}
          <va-button @click="addLink()" :disabled="selIds.size !== 2 ? 'disabled': null" :rounded="false">Create link</va-button>
        </div>
      </div>
    </div>
  </div>

  <div class="container">
    <div ref="resizeRef">
      <svg ref="svgRef">
          </svg>
    </div>
  </div>

</template>

<script>

  import { onMounted, ref, watchEffect, reactive } from 'vue';
  import * as d3 from 'd3';
  import useResizeObserver from '@/resize';
  export default {
    name: 'GraphChart',
    props: ['data'],
    setup(props) {
      // create ref to pass to D3 for DOM manipulation
      const svgRef = ref(null);
      // create another ref to observe resizing, since observing SVGs doesn't work!
      const { resizeRef, resizeState } = useResizeObserver();
      console.log('setup');
      const scale = d3.scaleOrdinal(d3.schemeCategory10);
      const selIds = reactive(new Map());
      const color = d => {
        return selIds.has(d.id) ? 'red' : scale(d.group);
      };
      let width, height;
      let sim;
      let node;
      let link;
      let edgepaths;
      let edgelabels;
      let Tooltip;
      let container;
      const radius = 12;
      const ticked = () => {
        node.attr(
          'transform',
          d =>
            `translate(${(d.x = Math.max(radius, Math.min(width - radius, d.x)))},${(d.y = Math.max(
              radius,
              Math.min(height - radius, d.y)
            ))})`
        );
        // .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        // .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
        // .attr("cx", d => d.x)
        // .attr("cy", d => d.y);
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        edgepaths.attr('d', d => 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y);
        edgelabels.attr('transform', function(d) {
          if (d.target.x < d.source.x) {
            const bbox = this.getBBox();
            const rx = bbox.x + bbox.width / 2;
            const ry = bbox.y + bbox.height / 2;
            return 'rotate(180 ' + rx + ' ' + ry + ')';
          } else {
            return 'rotate(0)';
          }
        });
      };
      const updateGraph = () => {
        selIds.clear();
        node = node
          .data(props.data.nodes)
          .join('g')
          .on('mouseover', mouseover)
          .on('mousemove', mousemove)
          .on('mouseout', mouseleave)
          .call(drag(sim));
        node
          .append('circle')
          // .attr("stroke", "white")
          .attr('id', function(d) {
            return d.id;
          })
          .on('click', function(event, d) {
            window.event.stopPropagation();
            console.log('shift', event.shiftKey);
            // console.log("d", d);
            if (event.shiftKey) {
              if (selIds.has(d.id)) {
                selIds.delete(d.id);
                d3.select(this).attr('fill', color);
              } else {
                selIds.set(d.id, d3.select(this));
                if (selIds.size > 2) {
                  const firstId = selIds.keys().next().value;
                  const theNode = selIds.get(firstId);
                  selIds.delete(firstId);
                  theNode.attr('fill', color);
                  console.log('clear', firstId);
                }
                d3.select(this).attr('fill', 'red');
              }
            }
          })
          // .attr("stroke-width", 1.5)
          .attr('r', radius)
          .attr('fill', color)
          .style('stroke', 'grey')
          .style('stroke-opacity', 0.3)
          .style('stroke-width', 10);
        node
          .append('text')
          .attr('x', 8)
          .attr('y', '0.31em')
          .text(d => d.id)
          // .clone(true).lower()
          // .attr("fill", "none")
          // .attr("stroke", "white")
          .attr('stroke-width', 3);
        link = link
          .data(props.data.links, d => [d.source, d.target])
          .join('line')
          // .attr("stroke-width", d => 3*Math.sqrt(d.value))
          .attr('stroke-width', 2)
          .join('path')
          // .attr("stroke", d => color(d.type))
          .attr('stroke', 'gray')
          // .attr("marker-end", d => `url(${new URL(`#arrow-${d.type}`, location)})`);
          .attr('marker-end', 'url(#arrowhead)');
        edgepaths = edgepaths
          .data(props.data.links)
          .join('path')
          .attr('class', 'edgepath')
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .attr('id', function(d, i) {
            return 'edgepath' + i;
          })
          .style('pointer-events', 'none');
        edgelabels = edgelabels
          .data(props.data.links)
          .join('text')
          .style('pointer-events', 'none')
          .attr('class', 'edgelabel')
          .attr('id', function(d, i) {
            return 'edgelabel' + i;
          })
          .attr('font-size', 10)
          .attr('fill', '#aaa');
        edgelabels
          .append('textPath') //To render text along the shape of a <path>, enclose the text in a <textPath> element that has an href attribute with a reference to the <path> element.
          .attr('xlink:href', function(d, i) {
            return '#edgepath' + i;
          })
          .style('text-anchor', 'middle')
          .style('pointer-events', 'none')
          .attr('startOffset', '50%')
          .text(d => d.type);
        // var link_label = svg.selectAll(".link_label")
        //     .data(props.data.links)
        //     .enter()
        //     .append("text")
        //     .text(function(d, i) {
        //         return d.n;
        //     });
        //
        // link.join("text")
        // .attr("dy", 5)
        // // .attr("filter", "url(#solid)")
        // .text(d => d.type);
        sim.nodes(props.data.nodes);
        sim.force('link').links(props.data.links);
        sim.alpha(1).restart();
        ticked();
      };
      const drag = simulation => {
        function dragstarted(event) {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        }
        function dragged(event) {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        }
        function dragended(event) {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        }
        return d3
          .drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended);
      };
      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        // console.log("mouseover");
        Tooltip.style('display', 'block');
        // d3.select(this)
        //   .style("stroke", "black")
        //   .style("opacity", 1)
      };
      var mousemove = function(event, d) {
        // console.log("mousemove", event.pageX, event.pageY);
        Tooltip.html(d.id)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 50 + 'px');
      };
      var mouseleave = function(d) {
        // console.log("mouseleave");
        Tooltip.style('display', 'none');
        // d3.select(this)
        //   .style("stroke", "none")
        //   .style("opacity", 0.8)
      };
      // https://observablehq.com/@d3/force-directed-graph
      onMounted(() => {
        console.log('mount');
        Tooltip = d3
          .select('#div_template')
          .append('div')
          .style('position', 'absolute')
          .style('display', 'none')
          .attr('class', 'tooltip')
          .style('background-color', 'white')
          .style('border', 'solid')
          .style('border-width', '2px')
          .style('border-radius', '5px')
          .style('padding', '5px');
        console.log('tooltip created');
        // pass ref with DOM element to D3, when mounted (DOM available)
        const svg = d3.select(svgRef.value);
        container = svg.append('g');
        // whenever any dependencies (like data, resizeState) change, call this!
        ({ width, height } = resizeState.dimensions);
        height *= 3;
        console.log('dims', width, height);
        svg.call(
          d3
            .zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', function(event) {
              // console.log("trans", event.transform);
              container.attr('transform', event.transform);
            })
        );
        const links = props.data.links.map(d => Object.create(d));
        // console.log(data.nodes);
        sim = d3
          .forceSimulation(props.data.nodes)
          .force(
            'link',
            d3.forceLink(links).id(d => d.id)
          )
          // .force("charge", d3.forceManyBody())
          .force(
            'collide',
            d3.forceCollide(function(d) {
              // return d.id === "j" ? 100 : 50
              return 70;
            })
          )
          .force('charge', d3.forceManyBody().strength(-60))
          // .force("charge", d3.forceManyBody().strength(-400))
          .force('center', d3.forceCenter(width / 2, height / 2))
          .force('x', d3.forceX())
          .force('y', d3.forceY())
          .on('tick', ticked);
        // const svg = d3.create("svg")
        svg.attr('viewBox', [0, 0, width, height]);
        // const types = ["ok"];
        // https://observablehq.com/@d3/mobile-patent-suits?collection=@d3/d3-force
        // Per-type markers, as they don't inherit styles.
        svg
          .append('defs')
          .append('marker')
          .attr('id', 'arrowhead')
          .attr('viewBox', '-0 -5 10 10') //the bound of the SVG viewport for the current SVG fragment. defines a coordinate system 10 wide and 10 high starting on (0,-5)
          .attr('refX', 18) // x coordinate for the reference point of the marker. If circle is bigger, this need to be bigger.
          .attr('refY', 0)
          .attr('orient', 'auto')
          .attr('markerWidth', 7)
          .attr('markerHeight', 7)
          .attr('xoverflow', 'visible')
          .append('svg:path')
          .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
          .attr('fill', '#999')
          .style('stroke', 'none');
        // svg.append("defs").selectAll("marker")
        //   .data(types)
        //   .join("marker")
        //     .attr("id", d => `arrow-${d}`)
        //     .attr("viewBox", "0 -5 10 10")
        //     .attr("refX", 15)
        //     .attr("refY", -0.5)
        //     .attr("markerWidth", 6)
        //     .attr("markerHeight", 6)
        //     .attr("orient", "auto")
        //   .append("path")
        //     .attr("fill", color)
        //     .attr("d", "M0,-5L10,0L0,5");
        link = container.append('g').selectAll('line');
        edgepaths = container.append('g').selectAll('.edgepath');
        edgelabels = container.append('g').selectAll('.edgelabel');
        node = container
          .append('g')
          .attr('fill', 'currentColor')
          // .attr("stroke-linecap", "round")
          // .attr("stroke-linejoin", "round")
          .selectAll('g');
        updateGraph();
        // watchEffect(() => {
        //   console.log("watch");
        // });
      });
      const name = ref('');
      const nodeTypes = [
        { title: 'Person', code: 1 },
        { title: 'Organization', code: 2 },
        { title: 'Place', code: 3 },
      ];
      const linkTypes = [
        { title: 'FRIEND_OF', code: 1 },
        { title: 'HIRED_BY', code: 2 },
        { title: 'BORN_IN', code: 3 },
        { title: 'FOLLOWED', code: 4 },
        { title: 'FOLLOWING', code: 5 },
      ];
      const nodeType = ref(nodeTypes[0]);
      const linkType = ref(linkTypes[0]);
      const addLink = () => {
        console.log('+link', linkType.value);
        props.data.links.push({
          source: Array.from(selIds.keys())[0],
          target: Array.from(selIds.keys())[1],
          value: linkType.value.code,
          type: linkType.value.title,
        });
        updateGraph();
      };
      const addPerson = () => {
        if (name.value) {
          console.log('click', name.value, nodeType.value?.code);
          props.data.nodes.push({
            id: name.value,
            group: Number(nodeType.value?.code),
          });
          name.value = '';
          updateGraph();
        }
      };
      return {
        svgRef,
        resizeRef,
        addPerson,
        name,
        nodeType,
        nodeTypes,
        linkType,
        linkTypes,
        addLink,
        selIds,
      };
    },
  };

</script>

<style>

  text {
    font-family: sans-serif;
    font-size: 10px;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .item {
    /*border: 1px solid rgb(212, 205, 205);*/
    background-color: #ffffff;
    text-align: center;
  }
  .box {
    margin: 0 auto;
    max-width: 200px;
  }
  body {
    overflow-y: hidden; /* Hide vertical scrollbar */
    overflow-x: hidden; /* Hide horizontal scrollbar */
  }
  .container {
    overflow: hidden;
  }

</style>
