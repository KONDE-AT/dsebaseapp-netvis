var spinner = new Spinner().spin();

const toArray = prop => (Array.isArray(prop) ? prop : [prop]);

const fetchData = (url, viscontainer) => {
  const visCard = document.getElementById(viscontainer);
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
          edges: toArray(graph.types.edges || [])
        }
      };
    })
    .catch(error => {
      visCard.removeChild(spinner.el);
      console.error("Error fetching graph", error);
    });
};

const createOverlay = () => {
  const overlay = document.createElement("div");
  overlay.setAttribute("id", "nerv-overlay");
  overlay.style.position = "fixed";
  overlay.style.top = 0;
  overlay.style.left = 0;
  overlay.style.right = 0;
  overlay.style.bottom = 0;
  overlay.style.display = "none";
  document.body.appendChild(overlay);
  return overlay;
};
const createPopoverContainer = () => {
  const popoverStyle = document.createElement("style");
  popoverStyle.appendChild(document.createTextNode(""));
  document.head.appendChild(popoverStyle);
  popoverStyle.sheet.insertRule(`
    [data-nerv-popover] {
      position: absolute;
      overflow-y: auto;
      background: white;
      border-radius: 4px;
      border: 1px solid #ddd;
      display: none;
      padding: 10px;
      box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.1);
    }
  `);
  const popover = document.createElement("div");
  popover.setAttribute("id", "nerv-popover");
  popover.setAttribute("data-nerv-popover", true);
  popover.setAttribute("role", "dialog");
  document.body.appendChild(popover);
  return popover;
};

const overlay = createOverlay();
const popover = createPopoverContainer();

let isPopoverOpen = false;
let previouslyFocusedElement = null;

const showPopover = ({ x, y, node, onDismiss, content }) => {
  isPopoverOpen = true;
  popover.appendChild(content);
  popover.style.display = "block";
  previouslyFocusedElement = document.activeElement;
  const rect = popover.getBoundingClientRect();
  const left =
    x + rect.width > window.innerWidth + window.pageXOffset
      ? x - rect.width
      : x;
  const top =
    y + rect.height > window.innerHeight + window.pageYOffset
      ? y - rect.height
      : y;
  popover.style.left = left + "px";
  popover.style.top = top + "px";
};

const hidePopover = () => {
  popover.style.display = "none";
  popover.innerHTML = "";
  isPopoverOpen = false;
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus();
    previouslyFocusedElement = null;
  }
};

const handleNodeClick = (createPopoverContent, viscontainer) => ({
  node,
  event,
  types
}) => {
  if (isPopoverOpen) return;

  const onDismiss = event => {
    document.removeEventListener("keyup", onEscape, false);
    overlay.removeEventListener("mousedown", onDismiss, false);
    overlay.style.display = "none";
    hidePopover();
  };

  const onEscape = event => {
    if (event.key === "Escape") {
      onDismiss();
    }
  };

  const content = createPopoverContent({ node, onDismiss, viscontainer, types });

  document.addEventListener("keyup", onEscape, false);
  overlay.addEventListener("mousedown", onDismiss, false);
  overlay.style.display = "block";

  showPopover({
    content,
    node,
    x: event.pageX,
    y: event.pageY,
    onDismiss
  });
};

// --- popover content ---
const createPopoverContent = ({ node, onDismiss, viscontainer, types }) => {
  const container = document.createElement("div");

  const nodeUl = document.createElement("ul");
  nodeUl.className = "list-unstyled";

  const popHeaderLink = document.createElement("a");
  popHeaderLink.href = node["detail_view"];
  popHeaderLink.innerText = `${node["label"]}`;

  const popHeader = document.createElement("h4");
  popHeader.appendChild(popHeaderLink);

  container.appendChild(popHeader);
  Object.keys(node)
    .filter(
      key =>
        ![
          "x",
          "y",
          "index",
          "fx",
          "fy",
          "vx",
          "vy",
          "__indexColor",
          "neighbors",
          "edges",
          "detail_view",
          "as_graph",
          "label"
        ].includes(key)
    )
    .forEach(key => {
      const value = node[key];
      const listItem = document.createElement("li");
      listItem.innerHTML = `<strong>${key}</strong>: ${value}`;
      nodeUl.appendChild(listItem);
    });

  const button = document.createElement("button");
  button.innerText = "Load more";
  button.addEventListener(
    "click",
    event => {
      if (!node) {
        console.error("No node found");
        return;
      }
      const url = node.as_graph;
      if (!url) {
        console.error("No URL specified");
        return;
      }
      fetchData(url, viscontainer).then(graph => render(graph, viscontainer));
      onDismiss();
    },
    false
  );

  container.appendChild(nodeUl);
  container.appendChild(button);

  return container;
};

const render = (graph, viscontainer) => {
  ReactDOM.render(
    React.createElement(NetworkVisualization.Visualization, {
      graph,
      dimensions: 2,
      children: props => [
        React.createElement(NetworkVisualization.ExportButton, props),
        React.createElement(NetworkVisualization.Legend, props)
      ],
      onNodeClick: handleNodeClick(createPopoverContent, viscontainer)
    }),
    document.getElementById(viscontainer)
  );
};

function showGraph(viscontainer, id, type) {
  const sourceUrl = `entity-as-graph.xql?id=${id}&type=${type}`;
  fetchData(sourceUrl, viscontainer).then(graph => render(graph, viscontainer));
}
