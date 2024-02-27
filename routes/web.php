<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleForecastController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Weather', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
        'apiKey' => env('OPENWEATHER_API_KEY', ''),
        'defaultData' => json_decode(file_get_contents(public_path('forecast.json')))
    ]);
});

Route::middleware('auth')->group(function () {
    Route::get('/schedule', [ScheduleForecastController::class, 'index'])->name('schedule.index');
    Route::post('/schedule', [ScheduleForecastController::class, 'store'])->name('schedule.store');
    Route::delete('/schedule', [ScheduleForecastController::class, 'cancel'])->name('schedule.cancel');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
