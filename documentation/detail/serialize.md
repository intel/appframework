$().serialize() serializes a form for use in a url.

Below is a form that we will serialize the values of

```html
<form id="serializeForm" onsubmit="return false">Name:
    <input type='text' class='af-ui-forms' name='name' value='John Smith'>
    <br>
    <input type='checkbox' class='af-ui-forms' value='yes' checked name='human'>
    <label for='human'>Are you human?</label>
    <br>
    <br>Gender: <span><select id='serialize_gender' name="gender"><option value='m'>Male</option><option value='f'>Female</option><select></span>
    <br>
    <br>
    <br>
    <input type="button" onclick="serializeForm()" value="Serialize">
</form>
```
