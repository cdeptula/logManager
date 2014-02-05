Pentaho Log Manager
===

The Pentaho Log Manager plugin for Pentaho BI Server allows you to view, download, and delete log files accessible from the BI Server file system.  The plugin is available to anyone with access to the Tools menu in BI Server which by default is only administrators.

A big thank you to my employer [OpenBI](http://www.openbi.com) for allowing me to open source this plugin.

System Requirements
---
- Pentaho BI Server 5.x or above
- Pentaho Ctools (CDE, CDA, CDF, CGG)

Installation
---
**Using Pentaho Marketplace**

1. In the Pentaho Marketplace find the Log Manager plugin and click Install
2. Restart BI Server

**Manual Install**

1. Place the logManager folder in the ${BI\_SERVER\_HOME}/pentaho-solutions/system/ directory
2. Restart BI Server

Configuration
---

The Pentaho Log Manager comes configured to work with most standard installations of BI Server; however, if you want to limit the logs that are managed through this plugin or use non-standard log locations additional configuration is required.

1. Edit the ${BI\_SERVER\_HOME}/pentaho-solutions/system/plv.xml file
2. Additional locations can be added by adding a <location> element in <locations>.  The <location> element must include the following attributes:
 1. path - the filesystem path to the log directory
 2. name - a value that you want to display in log manager for the file path of the log.  This essentially allows for relative pathing allowing you to show /tomcat/logs instead of /usr/lib/pentaho/biserver-ee/tomcat/logs in the plugin.
 3. An example: <location path="/usr/lib/pentaho/biserver-ee/tomcat/logs" name="/tomcat/logs" />
3. The log files that appear in BI Server can be limited using regular expressions. This is done using the <fileRegex> element under <files>.  The <fileRegex> element must contain the following attributes:
 1. regex - The regular expression to match the log file name.
 2. type - A log type the regex matches.  This does not appear anywhere in the plugin but is required for potential future enhancements.
 3. An example: <fileRegex regex="[Cc]atalina.*" type="Catalina" />

Contributing
---

The Log Manager plugin is a Sparkl application.  To contribute patches or enhancements Install Sparkl and the Log Manager plugin.  You will be able to edit and make improvements to the Log Manager plugin using the Sparkl plugin.

Known Problems
---

- The Windows zip utility sees the downloaded zip of the log file as being empty.  You must use an alternative utility such as 7-zip.
- The View Log button on Safari does not work.  It fails with a broken pipe error in the logs.
