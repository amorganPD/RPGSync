using Microsoft.Owin;
using Owin;
[assembly: OwinStartup(typeof(RpgSync.Startup))]


namespace RpgSync
{
    public class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            // Any connection or hub wire up and configuration should go here
            app.MapSignalR();
        }
    }
}