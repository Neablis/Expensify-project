<?php

  require_once('../script.php');
  if (!loggedIn()) {
    header('HTTP/1.1 401 Unauthorized');
    die();
  }

  $res = apiRequest('https://api.expensify.com?command=CreateTransaction&authToken='.$_COOKIE['authToken'].'&created='.rawurlencode($_REQUEST['created']).'&amount='.rawurlencode($_REQUEST['amount']).'&merchant='.rawurlencode($_REQUEST['merchant']));

  if (isset($res->authToken)) {
    updateAuthToken($res->authToken);
  }

  ajaxReturn(json_encode($res));
  
  //$response = buildResponse($res);
  //debug(print_r($response, true));
  //ajaxReturn(json_encode($response));
?>
