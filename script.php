<?php

  
  function apiRequest($url) {
    // The API end can handle data sanization. No reason to do it here.
    $res = file_get_contents($url);

    if ($res != false) {
      return json_decode($res);
    } else {
      header('HTTP/1.1 500 Internal Server Error');
      die();
    }
  }

 /*
    created         : "yyyy-mm-dd hh:mm:ss" - in UTC
    amount          : In pennies.  Negative if sale.  Positive if return.
    merchant        :
    modifiedAmount  : We need to keep the original amount for eReceipts.  This was added in case a user wants to change the amount of a transaction.
    modifiedMerchant: We need to keep the original merchant for the eReceipt.  This was added in case a user wants to pretty up the merchant line.
  */
  function buildResponse($res) {
    $response = array('jsonCode' => $res->jsonCode, 'transactionList' => array());
    if (isset($res->transactionList)) {
      foreach ($res->transactionList as $transaction) {
        $response['transactionList'][] = array(
          'amount' => htmlentities($transaction->amount),
          'modifiedAmount' => htmlentities($transaction->modifiedAmount),
          'merchant' => htmlentities($transaction->merchant),
          'modifiedMerchant' => htmlentities($transaction->modifiedMerchant),
          'modified' => htmlentities($transaction->modified),
          'created' => htmlentities($transaction->created));
      }
    }
    return $response;
  }

  function loggedIn() {

    if (isset($_COOKIE['authToken'])) {
      return true;
    } else {
      return false;
    }
  }

  function ajaxReturn($message) {
    header('Content-Type: application/json');
    echo $message;
  }

  function updateAuthToken($authToken) {
    // Make sure httpOnly is false since javascript needs cookie access.
    $myDomain =  preg_replace('/^[^\.]*\.([^\.]*)\.(.*)$/', '\1.\2', $_SERVER['HTTP_HOST']);  
  
    $setDomain = ($_SERVER['HTTP_HOST']) != "localhost" ? $myDomain : false;  
    setcookie('authToken', $authToken, time() + 3600, '/', $setDomain, 0 , 0 );
  }
?>
