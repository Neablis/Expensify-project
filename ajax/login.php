<?php
  require_once('../script.php');

  $res = apiRequest('https://api.expensify.com?command=Authenticate&partnerName=applicant&partnerPassword=d7c3119c6cdab02d68d9&partnerUserID='.rawurlencode($_REQUEST['email']).'&partnerUserSecret='.rawurlencode($_REQUEST['password']).'&useExpensifyLogin=true');
  if ($res->httpCode == 401) {
    header('HTTP/1.1 401 Unauthorized');
    die();
  }
  if (isset($res->authToken)) {
    updateAuthToken($res->authToken);
  }

  $response = array('jsonCode' => $res->jsonCode);
  ajaxReturn(json_encode($response));
?>
