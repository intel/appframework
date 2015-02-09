/** @jsx React.DOM */
$.afui.ready(function(){
  var _todoList=[];

  var todo = React.createClass({
    render: function() {
      return (
        <li>{this.props.name}</li>
      );
    },
    componentDidMount:function(){
      $(this.getDOMNode()).on("longTap",function(e){
          var cf=confirm("Are you sure you want to delete this item?")
          if(!cf) return;
          var item=e.target;
          React.unmountComponentAtNode(item);
          $(item).remove();
          _todoList.splice(_todoList.indexOf(item.innerHTML));
      });
    },
    componentWillUnmount:function(){
      console.log("remove test");
    }
  });



  var todolist = React.createClass({
    render: function() {
      var items=_todoList.map(function(item){
          return (
              <todo name={item}/>
          );
      });
      return (
        <ul className="list inset">{items}</ul>
      );
    }
  });



  /** @jsx React.DOM */
  var todoform = React.createClass({
    handleSubmit: function(e) {
      e.preventDefault();
      var val=this.refs.todoVal.getDOMNode().value.trim();
      if(val.length<2)
          return;
      _todoList.push(val);
      this.refs.todoVal.getDOMNode().value=null;
      renderTodos();
      return;
    },
    render: function() {
      return (
         <div><input ref="todoVal" type='text' placeholder='Enter Todo' />
         <a className='button addBtn' onClick={this.handleSubmit}>Add</a></div>
      );
    }
  });
  React.renderComponent(
    <todoform />,
    document.getElementById('todoform')
  );

  function renderTodos(){
      React.renderComponent(
          <todolist />,
          document.getElementById('todolist')
      );
  }
  renderTodos();
});