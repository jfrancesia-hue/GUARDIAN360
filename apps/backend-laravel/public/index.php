<?php

declare(strict_types=1);

header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'service' => 'backend-laravel',
    'message' => 'Guardian360 Admin listo para scaffold Laravel 11',
], JSON_THROW_ON_ERROR);
