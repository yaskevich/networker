<template>
  <h1>Network</h1>
  <div class="chart-holder-graph">
    <Graph :data="data" />
  </div>
</template>

<script>
import Graph from "../components/Graph.vue";
export default {
  name: "Dashboard",
  components: {
    Graph,
  },
  data() {
    return {
      data: {
        "nodes": [
          {"id": "Petrov", "group": 2},
          {"id": "Ivanov", "group": 2},
          {"id": "Sidorov", "group": 1},
          {"id": "Smith", "group": 1},
          {"id": "Atlantis", "group": 3},
        ],
        "links": [
          {"source": "Ivanov", "target": "Petrov", "value": 1, "type": "FRIEND_OF"},
          {"source": "Sidorov", "target": "Ivanov", "value": 1, "type": "HIRED_BY"},
          {"source": "Ivanov", "target": "Smith", "value": 2, "type": "FOLLOWED"},
        ]
      }
    };
  },
  methods: {

  },
};
</script>

<style>
.chart-holder-graph {
  text-align: center;
  color: #2c3e50;
  /* max-width: 720px; */
  /* margin: 100px auto;
  padding: 0 20px; */
}
svg {
  /* important for responsiveness */
  display: block;
  fill: none;
  stroke: none;
  width: 100%;
  height: 100%;
  overflow: visible;
  background: #eee;
}

</style>
