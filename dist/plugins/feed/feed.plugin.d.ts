import { Plugin, PluginRoute } from "../../components/plugins/Plugin";
/**
 * This core plugin handles the feed/index page.
 */
declare class Feed extends Plugin {
    constructor();
    routes(): PluginRoute[];
}
export default Feed;
