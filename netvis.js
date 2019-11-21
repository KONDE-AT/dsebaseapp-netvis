function showGraph(viscontainer, id, type) {
  const sourceUrl = `entity-as-graph.xql?id=${id}&type=${type}`;
  const visCard = document.getElementById(viscontainer);
  var spinner = new Spinner().spin();

  const toArray = prop => Array.isArray(prop) ? prop : [prop]

  const fetchData = url => {
    visCard.appendChild(spinner.el);

    return fetch(url)
      .then(response => response.json())
      .then(graph => {
        visCard.removeChild(spinner.el);

        return {
          nodes: toArray(graph.nodes || []),
          edges: toArray(graph.edges || []),
          types: {
            nodes: toArray(graph.types.nodes || []),
            edges: toArray(graph.types.edges || []),
          }
        }
      })
      .catch(error => {
        visCard.removeChild(spinner.el);
        console.error("Error fetching graph", error)
      })
  }

  const render = graph => {
    ReactDOM.render(
      React.createElement(NetworkVisualization.Visualization, {
        graph,
        dimensions: 2,
        children: props => [
            React.createElement(NetworkVisualization.ExportButton, props),
            React.createElement(NetworkVisualization.Legend, props)
        ],
        onNodeClick: ({
          node
        }) => {
          if (!node) {
            console.error("No node found");
            return;
          }
          const url = node.as_graph;
          if (!url) {
            console.error("No URL specified");
            return;
          }
          fetchData(url).then(render)
        }
      }),
      document.getElementById(viscontainer)
    );
  };

  fetchData(sourceUrl).then(render)
}
