<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_login()
    {
        $this->get(route('tasks.index'))->assertRedirect(route('login'));
        $this->post(route('tasks.store'), ['title' => 'Algo'])->assertRedirect(route('login'));
        $this->patch(route('tasks.update', 1))->assertRedirect(route('login'));
        $this->delete(route('tasks.destroy', 1))->assertRedirect(route('login'));
    }

    public function test_unverified_users_cannot_manage_tasks()
    {
        $user = User::factory()->unverified()->create();

        $this->actingAs($user)
            ->get(route('tasks.index'))
            ->assertRedirect(route('verification.notice'));
    }

    public function test_index_shows_only_the_authenticated_users_tasks()
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $user->tasks()->create(['title' => 'Mía']);
        $other->tasks()->create(['title' => 'Ajena']);

        $this->actingAs($user)
            ->get(route('tasks.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('tasks/index')
                ->has('tasks', 1)
                ->where('tasks.0.title', 'Mía')
            );
    }

    public function test_users_can_create_a_task()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post(route('tasks.store'), [
                'title' => 'Comprar café',
                'notes' => 'Medio kilo',
                'due_date' => '2026-12-01',
            ])
            ->assertRedirect(route('tasks.index'));

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title' => 'Comprar café',
            'notes' => 'Medio kilo',
            'completed' => false,
        ]);
    }

    public function test_creating_a_task_requires_a_title()
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->from(route('tasks.index'))
            ->post(route('tasks.store'), ['title' => ''])
            ->assertRedirect(route('tasks.index'))
            ->assertSessionHasErrors('title');

        $this->assertDatabaseCount('tasks', 0);
    }

    public function test_users_can_update_their_task()
    {
        $task = User::factory()->create()->tasks()->create(['title' => 'Original']);

        $this->actingAs($task->user)
            ->patch(route('tasks.update', $task), [
                'title' => 'Editada',
                'notes' => 'Con notas',
                'due_date' => '2026-12-24',
            ])
            ->assertRedirect(route('tasks.index'));

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Editada',
            'notes' => 'Con notas',
        ]);
    }

    public function test_users_can_toggle_completed()
    {
        $task = User::factory()->create()->tasks()->create(['title' => 'Pendiente']);

        $this->actingAs($task->user)
            ->patch(route('tasks.update', $task), ['completed' => true])
            ->assertRedirect(route('tasks.index'));

        $this->assertTrue($task->fresh()->completed);

        $this->actingAs($task->user)
            ->patch(route('tasks.update', $task), ['completed' => false])
            ->assertRedirect(route('tasks.index'));

        $this->assertFalse($task->fresh()->completed);
    }

    public function test_users_cannot_update_another_users_task()
    {
        $task = User::factory()->create()->tasks()->create(['title' => 'Ajena']);
        $intruder = User::factory()->create();

        $this->actingAs($intruder)
            ->patch(route('tasks.update', $task), ['title' => 'Robada'])
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', ['id' => $task->id, 'title' => 'Ajena']);
    }

    public function test_users_can_delete_their_task()
    {
        $task = User::factory()->create()->tasks()->create(['title' => 'Para borrar']);

        $this->actingAs($task->user)
            ->delete(route('tasks.destroy', $task))
            ->assertRedirect(route('tasks.index'));

        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    public function test_users_cannot_delete_another_users_task()
    {
        $task = User::factory()->create()->tasks()->create(['title' => 'Ajena']);
        $intruder = User::factory()->create();

        $this->actingAs($intruder)
            ->delete(route('tasks.destroy', $task))
            ->assertForbidden();

        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
    }
}
