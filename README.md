[UI5 Playground!](http://randelic.github.io/ui5/app/)
===================

>This application is meant to be a starting place for UI5 development. It is a collection of practical web development solutions to common problems/requirements encountered by SAPUI5/OpenUI5 developers as well as a collection of demos that make use of the foundation libraries used herein. This project is intended to be a collaboration with the UI5 development community, so everyone is welcome to participate.

Overview
-------------
### Features
- **Grunt connect proxy with a fallback on public [corsproxy.com](http://www.corsproxy.com/) when not using Grunt.js**
	
	*This will allow you to will allow you to easily work against 3rd party domains without worrying about CORS* 	 
- **Dynamic Routing**
	
	*Takes a convention-over-configuration approach to routing, there are no pre-configured routes configured for any of the featured demos, e.g [Products](http://randelic.github.io/ui5/app/#/Product), or [Product Detail](http://randelic.github.io/ui5/app/#/Product)*
- **OData search**
- **Controller hirearchy with abstract base controller with support for:**
	- constructor and init chaining,
	- global models managment,
	- simplified APIs for i18n, routing, valid values, custom-filters
- **Model inheritance hierarchy for fragments and fragment-dialogs**
- **Static filter management on OData bindings**

The playground depends on [ui5lib](https://github.com/randelic/ui5lib), which is a collection of libraries that complement the UI5 framework.

> **ui5lib Overview**
> 
> - **func.js** Functional JavaScript library to complete functionality missing from jQuery, has some prototype enrichment
> - **ui5.js** UI5 helper function given in the "ui" namespace.
> - **ui5x** Extensions and enhancements to SAPUI5 framework objects, such as OData search and static OData filters.
> - **base/Controller.js** An abstract base controller for all of your application controllers. It extends sap.ui.core.mvc.Controller with additionaly APIs for method chaining, model management, simple routing and route matching, simple i18n, etc...

###Usage

1. Develop locally
 1. Clone or download
 2. In the repository root run
 ```
 $ npm install
 $ grunt server
 ```
2. View on web [here](http://randelic.github.io/ui5/app/)
 


## <a name="h.ga7qarafaaxj"></a><span>Notes</span>

### <a name="h.14dkl2fyl983"></a><span>Performance</span>

<span>Performance was completely ignored as of this writing, but this will change. Feel free to apply any performance enhancements and contribute back to either of the projects, “</span><span class="c15">[UI5 Playground](https://www.google.com/url?q=https%3A%2F%2Fgithub.com%2Frandelic%2Fui5&sa=D&sntz=1&usg=AFQjCNEWBbX0seE6OZe0Rg4SGRzunUEY9Q)</span><span>” or “</span><span class="c15">[ui5lib](https://www.google.com/url?q=https%3A%2F%2Fgithub.com%2Frandelic%2Fui5lib&sa=D&sntz=1&usg=AFQjCNEnx299EJDSGzPcUelLBDC4pjdiTg)</span><span>”. More in the roadmap.</span>

### <a name="h.ixx0zfs6gpm8"></a><span>Disclosure</span>

<span>Though I work at SAP the projects presented here do not present official guidelines for SAP/OpenUI5 development. I have not yet had the time to collaborate with SAPUI5 team on this, though I would very much would like to. I’m looking forward to collaborating with anyone with a passion for web and/or mobile development that wants to contribute to SAPUI5 development.</span>

## <a name="h.mxiodk5rk0jd"></a><span>Roadmap</span>

*   <span>Automated testing on Node.js with Selenium - great for multi-platfom and design-time as well as testing from CI like Jenkins</span>
*   <span>Better SoC and Bundling of optimized packages in ui5lib for app consumption</span>
*   <span>Data mocking using the SAPUI5 mock server component</span>
*   <span>Improved dynamic/convention routing.
    improved performance via overridable defaults for convention lookup.</span>
*   <span>New controls for in common client application scenarios (such as the HereMap control demoed </span><span class="c15">[here](http://www.google.com/url?q=http%3A%2F%2Frandelic.github.io%2Fui5%2Fapp%2F%23%2FHereMap&sa=D&sntz=1&usg=AFQjCNGUmgXxsXiWLER7XbHD4gjYmA8bMA)</span><span>)</span>
*   <span>More documentation and posts</span>
