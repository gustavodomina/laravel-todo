<?php

namespace Tests\Unit;

use App\Models\Task;
use App\Models\User;
use Carbon\CarbonInterface;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_completed_is_cast_to_boolean()
    {
        $task = new Task(['title' => 'X', 'completed' => 1]);

        $this->assertIsBool($task->completed);
        $this->assertTrue($task->completed);
    }

    public function test_due_date_is_cast_to_a_date()
    {
        $task = new Task(['title' => 'X', 'due_date' => '2026-12-01']);

        $this->assertInstanceOf(CarbonInterface::class, $task->due_date);
        $this->assertSame('2026-12-01', $task->due_date->toDateString());
    }

    public function test_a_task_belongs_to_a_user()
    {
        $user = User::factory()->create();
        $task = $user->tasks()->create(['title' => 'X']);

        $this->assertTrue($task->user->is($user));
    }

    public function test_user_id_cannot_be_mass_assigned()
    {
        $task = new Task(['title' => 'X', 'user_id' => 999]);

        $this->assertNull($task->user_id);
    }
}
