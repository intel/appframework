//This creates an instance of the todo object
function Todo(text, isComplete, isArchived) {
    return {
        Text: text,
        IsComplete: isComplete,
        IsArchived: isArchived,
        handleCheck: function () {
            this.resetTodo();
        },
        handleArchive: function () {
            this.IsArchived = true;
            this.resetTodo();
        },
        resetTodo: function () {
            viewModel.removeTodo(this);
            viewModel.addTodo(this);
            resetListeners();
        }
    }
};

//This is our view model for knockout
var viewModel = {
    activeTodos: ko.observableArray([]),
    archivedTodos: ko.observableArray([]),
    completedTodos: ko.observableArray([]),
    newTodo: ko.observable(""),
    addTodo: function (todo) {
        if (todo.IsArchived) {
            viewModel.archivedTodos.push(todo);
        } else {
            if (todo.IsComplete) {
                viewModel.completedTodos.push(todo);
            } else {
                viewModel.activeTodos.push(todo);
            }
        }
    },
    removeTodo: function (todo) {
        if (viewModel.archivedTodos.indexOf(todo) > -1)
            viewModel.archivedTodos.splice(viewModel.archivedTodos.indexOf(todo), 1);
        if (viewModel.completedTodos.indexOf(todo) > -1)
            viewModel.completedTodos.splice(viewModel.completedTodos.indexOf(todo), 1);
        if (viewModel.activeTodos.indexOf(todo) > -1)
            viewModel.activeTodos.splice(viewModel.activeTodos.indexOf(todo), 1);
    },
    handleSave: function () {
        if (viewModel.newTodo().length > 0) {
            var todo = new Todo(viewModel.newTodo(), false, false);
            viewModel.addTodo(todo);
            viewModel.newTodo("");
        }
    },
    handleCancel: function () {
        viewModel.newTodo("");
    }
}  

//When the app is loaded, we'll create a few to-dos pre-poulated
var init = function () {
        $.ui.showBackbutton = false;

        viewModel.addTodo(new Todo("take out the garbage", false, false));
        viewModel.addTodo(new Todo("fix door knob", false, false));
        viewModel.addTodo(new Todo("pick up dinner", false, false));
        viewModel.addTodo(new Todo("change diaper", true, false));
        viewModel.addTodo(new Todo("finish todo app", true, false));
        viewModel.addTodo(new Todo("wake up today", true, true));
        viewModel.addTodo(new Todo("make todo pretty", false, true));

        ko.applyBindings(viewModel);

        resetListeners();
    };
document.addEventListener("DOMContentLoaded",init,false);

//
var swipRightListener = function (evt) {
    $(this).closest("li").find("span").toggle();
};
var swipLeftListener = function (evt) {
    $(this).closest("li").find("span").toggle();
};

function resetListeners() {
    $("ul.mainScreen div.todo-text").unbind("swipeRight", swipRightListener);
    $("ul.mainScreen div.todo-text").unbind("swipeLeft", swipLeftListener);
    $("ul.mainScreen div.todo-text").bind("swipeRight", swipRightListener);
    $("ul.mainScreen div.todo-text").bind("swipeLeft", swipLeftListener);
}
