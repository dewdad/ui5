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
-- constructor and init chaining,
-- global models managment,
-- simplified APIs for i18n, routing, valid values, custom-filters
- **Model inheritance hierarchy for fragments and fragment-dialogs**
- **Static filter management on OData bindings**

The playground depends on [UI5lib](https://github.com/randelic/ui5lib), which is a collection of libraries that complement UI5 development.

