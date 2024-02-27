<?php

namespace App\Http\Controllers;

use App\Models\ScheduleForecast;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleForecastController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Schedule/Index', [
            //
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'location' => 'required|string|max:255',
        ]);

        $request->user()->schedule()->create($validated);

        return redirect(RouteServiceProvider::WEATHER);
    }

    /**
     * Display the specified resource.
     */
    public function show(ScheduleForecast $scheduleForecast)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ScheduleForecast $scheduleForecast)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ScheduleForecast $scheduleForecast)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request)
    {
        //
    }

    public function cancel(): RedirectResponse
    {
        return Redirect::to('/');
    }
}
