/* nodemon wants to autorun a script, which prevents being able to control when exactly the script 
runs and how many times it's run. this is a placeholder to get around that. we're instead watching
nodemon's events once this file completes "running" and responding to those, which allows for more
control. */
