
/*
 *
 *   Send request for authToken, if successful get transactions, else display error
 *
 */
function login() {
  var error = 0;
  fields = [$('#email'), $('#password')];
  jQuery.each(fields, function(i, obj) {
    if (validatePresence(obj) == false) {
      error = 1;
    }
  });

  if (error != 1) {
    $.ajax({
      type: 'POST',
      url: 'ajax/login.php',
      data: 'email='+$('#email').val()+'&password='+$('#password').val(),
      success: function(data) {
        if (data.jsonCode != 200) {
          errorHandler(data);
          return;
        }

        $('#login_dialog').dialog('close');
        populateTransactions();
      },
      statusCode: {
        401: function() {
          displayError('Your username or password was incorrect. Please try again.');
        },
        500: function() {
          displayError('Error communicating with Expensify. Please try again later.');
        }
      }
    });
  }
}

/*
 *
 *   Retrieve all transactions and fill the table with them. Then update table and sort.
 *
 */
function populateTransactions() {
  $('#loader').show();
  $.ajax({
    url: 'ajax/getTransactions.php',
    success: function(data) {
      if (data.jsonCode != 200) {
        errorHandler(data);
        return;
      }
      if(data.transactionList != null && data.transactionList.length != 0 ){  
        jQuery.each(data.transactionList, function(i, transaction) {
          $('tbody').append('<tr><td>'+merchantHelper(transaction)+'</td><td>$ '+moneyHelper(transaction)+'</td><td>'+transaction.created+'</td></tr>');
        });

        $('#transactions_table').tablesorter();
        $('#transactions_table').tablesorterPager({container: $("#pager")}); 
      }else{
        displayMessage('You have 0 transactions');
        $('tbody').append('<tr>  <td></td><td>  </td><td>  </td></tr>');
      }
      
      $('#transactions_container').show();
      $('#loader').effect('fade');
    },
    statusCode: {
      401: function() {
        displayError('Auth Token not found. Please log in.', true);
      },
      500: function() {
        displayError('Error communicating with Expensify. Please try again later.');
      }
    }
  });
}

/*
 *
 *   creates a transaction, if successful display message, otherwise display error
 *
 */
function createTransaction() {
  var error = 0;
  fields = [$('#merchant'), $('#amount'), $('#created')];
  jQuery.each(fields, function(i, obj) {
    if (validatePresence(obj) == false) {
      error = 1;
    }
  });

  if (error != 1) {
    $.ajax({
      type: 'POST',
      url: 'ajax/createTransaction.php',
      data: 'created='+$('#created').val()+'&amount='+$('#amount').val() * 100+'&merchant='+$('#merchant').val(),
      success: function(data) {
        if (data.jsonCode != 200) {
          errorHandler(data);
          return;
        }
        displayMessage('Successfully added expense');
        $('#transaction_dialog').dialog('close');

      },
      statusCode: {
        401: function() {
          displayError('Auth Token not found. Please log in.', true);
        },
        500: function() {
          displayError('Error communicating with Expensify. Please try again later.');
        }
      }
    });
  }
}

/*
 *
 *   checks object for value, if doesnt exist, error, else happy border. 
 *
 */
function validatePresence(obj) {
  if ((obj != undefined) && (obj.val() != '')) {
    obj.css('border', '1px solid #fff');
    return true;
  } else {
    obj.css('border', '2px solid #f00');
    return false;
  }
}


/*
 *
 *   Displays error message ( Didnt combine method with Display Message for readability
 *   And extensibility of these functions.
 *
 */
function displayError(message, redirect) {
  $('#error p').html(message);
  $('#error').fadeToggle();
  setTimeout(function() {
    $('#error').toggle('slow', function() {
      $('#error p').html('')
    });
  }, 2500);
  
  //incase loading is showing in rare glitches
  $('#loader').effect('fade');

  if ((redirect != undefined) && (redirect == true)) {
    $('#transactions_container').hide();
    $('#login_dialog').dialog('open');
  }
}

/*
 *
 *   Displays all messages that arnt error (Logout and Transaction successful)
 *
 */
function displayMessage(message) {
  $('#message p').html(message);
  $('#message').fadeToggle();
  setTimeout(function() {
    $('#message').toggle('slow', function() {
      $('#message p').html('')
    });
  }, 2500);
}

/*
 *
 *   Interpret the right json code and return a accurate error.
 *
 */
function errorHandler(data) {
  switch(data.jsonCode) {
    case 402:
      displayError('Your request was invalid. Please try again.');
      break;
    case 407:
      displayError('Your session is invalid. Please log in again', true);
      break;
    case 408:
      displayError('Your session has expired. Please log in again.', true);
      break;
    case 500:
      displayError('Action was aborted. Please check your input and try again.');
      break;
    default:
  }
  $('#loader').effect('fade'); // In case an error occurs while loading transactions.
}

 
function merchantHelper(data) {
  if ((data.modified == true) && (data.modifiedMerchant != undefined)) {
    return data.modifiedMerchant;
  } else {
    return data.merchant;
  }
}

/*
 *
 *   Accepts the right field, then converts the data.amount ( in pennys ) into the form $xx.xx
 *
 */
function moneyHelper(data) {
  var val;
  if ((data.modified == true) && (data.modifiedAmount != undefined)) {
    val = data.modifiedAmount / 100;
  } else {
    val = data.amount / 100;
  }

  val = val.toFixed(2);

  if (val < 0) {
    val = '<span class="negative">'+val+'</span>';
  }

  return val;
}


$(document).ready(function() {
  $('#login_dialog').dialog({
    autoOpen: false,
    width: 386,
    open: function(event, ui) {
      $(".ui-dialog-titlebar-close").hide();
    },
    close: function() {
      $('#password').val('');
    },
    buttons: {
      'Login': function() {
        login();
      }
    }
  });

  $('#transaction_dialog').dialog({
    autoOpen: false,
    width: 386,
    modal: true,
    closeOnEscape: true,
    close: function() {
      fields = [$('#merchant'), $('#amount'), $('#created')];
      jQuery.each(fields, function(i, obj) {
        if (obj != undefined) {
          if( obj.id == 'merchant'){
            
          }
          obj.val('');
          obj.css('border', '1px solid #fff'); // In case there were errors
        }
      });
    },
    buttons: {
      'Add': function() {
        createTransaction();
      },
      'Cancel': function() {
        $(this).dialog('close');
      }
    }
  });

  $('button').button();
  $('#created').datepicker({dateFormat: 'yy-mm-dd'});
  $('#add_transaction').click(function() {
    $('#transaction_dialog').dialog('open');
  });
  
  $('#logout').click(function() {
    $.cookies.del('authToken');
    location.reload(true);
  });

  if ($.cookies.get('authToken') == null) {
    $('#login_dialog').dialog('open');
  } else {
    populateTransactions();
  }
});
