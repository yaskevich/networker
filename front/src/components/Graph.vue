<template>
  <div id="div_template"></div>
  <div ref="resizeRef">
    <svg ref="svgRef">
    </svg>
  </div>
</template>

<script>
import { onMounted, ref, watchEffect } from "vue";
import * as d3 from "d3";
import useResizeObserver from "@/resize";
export default {
  name: "GraphChart",
  props: ["data"],
  setup(props) {
    // create ref to pass to D3 for DOM manipulation
    const svgRef = ref(null);
    // create another ref to observe resizing, since observing SVGs doesn't work!
    const { resizeRef, resizeState } = useResizeObserver();
    console.log("setup");
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

      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);
    };



// https://observablehq.com/@d3/force-directed-graph

    onMounted(() => {
      var Tooltip = d3.select("#div_template")
          .append("div")
          .style("position", "absolute")
          .style("display", "none")
          .attr("class", "tooltip")
          .style("background-color", "white")
          .style("border", "solid")
          .style("border-width", "2px")
          .style("border-radius", "5px")
          .style("padding", "5px");
          console.log("tooltip created");
      // Three function that change the tooltip when user hover / move / leave a cell
      var mouseover = function(d) {
        console.log("mouseover");
        Tooltip
          .style("display", "block")
        // d3.select(this)
        //   .style("stroke", "black")
        //   .style("opacity", 1)
      }
      var mousemove = function(event, d) {
        // console.log("mousemove", event.pageX, event.pageY);
        Tooltip
          .html(d.id)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 50) + "px");
      }
      var mouseleave = function(d) {
        console.log("mouseleave");
        Tooltip
          .style("display", "none")
        // d3.select(this)
        //   .style("stroke", "none")
        //   .style("opacity", 0.8)
      }
      console.log("mount");
      const data = props.data;
      const scale = d3.scaleOrdinal(d3.schemeCategory10);
      const color = (d) => {
        // console.log(d.group);
        return scale(d.group);
      };
      // pass ref with DOM element to D3, when mounted (DOM available)
      const svg = d3.select(svgRef.value);
      // whenever any dependencies (like data, resizeState) change, call this!
      let { width, height } = resizeState.dimensions;
      height *=3;
      console.log("dims", width, height);

      const links = data.links.map(d => Object.create(d));
      const nodes = data.nodes; //.map(d => Object.create(d));
      // console.log(data.nodes);

      const simulation = d3.forceSimulation(nodes)
          .force("link", d3.forceLink(links).id(d => d.id))
          .force("charge", d3.forceManyBody())
          .force("center", d3.forceCenter(width / 2, height / 2));

      // const svg = d3.create("svg")
          svg.attr("viewBox", [0, 0, width, height]);


      const link = svg.append("g")
        .attr("stroke", "#999")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", d => Math.sqrt(d.value));

      const node = svg.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(nodes)
        .join("circle")
        .attr("r", 5)
        .attr("fill", color)
        .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseout", mouseleave)
        .call(drag(simulation));

      // node.append("title")
      //     .text(d => d.id);

      simulation.on("tick", () => {

          const radius  = 6;
        node
        .attr("cx", function(d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });
            // .attr("cx", d => d.x)
            // .attr("cy", d => d.y);
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
      });

      // invalidation.then(() => simulation.stop());

      return svg.node();


      watchEffect(() => {
        console.log("watch");



      });
    });
    return { svgRef, resizeRef };
  },
};
</script>
