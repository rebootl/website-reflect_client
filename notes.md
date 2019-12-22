Questions:

- fix triggers
  - entries-list update
  - auto show/hide create entry on logout/login
- click logo to "home" view
- add edit-view
- fix create buttons
- fix link detection
- ..
- maybe entry-content/header sub-components not needed anymore now, since using entry-item?
- ..

## ToDo

* -> don't update from router if url doesn't effectively changed
  -> update url inside router
* integrate project-Data => WIP
* rework style LUL
* accessibility: topics-list not using keyboard tabs
* check script/view for duplicate id's, broken links
* make entry input a textarea => DONE

--- (old) ---

* add new-entry input elements
* make new/edit elements for topics and subtags
* encrypt private entries (probably Server side)
* Server side: change db public/private field => OBSOLETE
* get rid of the global_state user obj. => DONE

### Done

* date string has an error => FIXED, using moment.js for now
* update stuff on login/logout => FIXED, done by proj. Data now
* add pinned entries ==> DONE
