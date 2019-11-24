# dsebaseapp-netvis

a [dsebaseapp](https://github.com/KONDE-AT/dsebaseapp) module to visualize your data as interactive network graph.

## install

add this repo to your dsebaseapp project,

* either as submodule `git add submodule https://github.com/KONDE-AT/dsebaseapp-netvis.git netvis`
* throug symlink `ln -s ../location/to/netvis-repo netvis`
* or by simply copy and paste the content of this repo into a `netvis` collection in your dsebaseapp

See e.g. [schnitzler-tagebuch-app](https://github.com/acdh-oeaw/schnitzler-tagebuch) as reference implementation

## config

In order to make the network-visualization work, you need to create a `netvis-config.xml` stored in `data/meta`. This config file provides a mapping needed to serialize your data to a network graph.
See following samples
* [schnitzler-tagebuch](https://github.com/acdh-oeaw/schnitzler-tagebuch-data/blob/master/meta/netvis-config.xml)
* [rita](https://github.com/reading-in-the-alps/rita2-data/blob/master/data/meta/netvis-config.xml)

## how it works

The module provides some helper functions in `netvis.xqm`, exposes an endpoint (`netvis/entity-as-graph.xql`) which expects two query parameter `id` and `type`. This endpoint is called by `netvis.html` which scaffolds the html/css/js code necessary to visualize the graph.
