Questions:

- fix triggers
  - entries-list update
  - auto show/hide create entry on logout/login
- click logo to "home" view
- maybe entry-content/header sub-components not needed anymore now, since using entry-item?
- ..

## ToDo

* -> don't update from router if url doesn't effectively changed
  -> update url inside router
* integrate project-Data
* check script/view for duplicate id's, broken links
* rework style LUL
* accessibility: topics-list not using keyboard tabs
* make entry input a textarea

--- (old) ---

* add new-entry input elements
* make new/edit elements for topics and subtags
* encrypt private entries (probably Server side)
* get rid of the global_state user obj.
* Server side: change db public/private field

### Done

* date string has an error => FIXED, using moment.js for now
* update stuff on login/logout => FIXED, done by proj. Data now
* add pinned entries ==> DONE
