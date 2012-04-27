<?php
  require_once('../script.php');
  if (!loggedIn()) {
    header('HTTP/1.1 401 Unauthorized');
    die();
  }
  
  $res = apiRequest('https://api.expensify.com?command=Get&authToken='.$_COOKIE['authToken'].'&returnValueList=transactionList');
  if (isset($res->authToken)) {
    updateAuthToken($res->authToken);
  }

  $response = buildResponse($res);
  ajaxReturn(json_encode($response));
?>
