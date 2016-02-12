import chai, {expect} from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import takeTen from "./take-ten";

chai.use(sinonChai);

import Queue from "../src/queue";

describe("`Queue` class", () => {

    describe("`push` method", () => {

        it("adds an element to the queue", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.queue).to.include(element);
        });

        it("triggers processing", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.process).to.have.callCount(1);
        });

    });

    describe("`process` method", () => {

        it("calls the consumer (asynchronously) on each element of the queue", done => {
            const consumer = sinon.spy(() => true);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            // Test the asynchronicity
            expect(consumer).to.have.callCount(0);
            takeTen(() => {
                expect(consumer).to.have.been.calledWith(0);
                expect(consumer).to.have.been.calledWith(1);
                expect(consumer).to.have.been.calledWith(2);
                expect(consumer).to.have.callCount(3);
            }, done);
        });

        it("removes elements from the queue", done => {
            const consumer = sinon.spy(() => true);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            takeTen(() => {
                expect(q.queue.length).to.equal(0);
            }, done);
        });

        it("doesn't remove elements from the queue if the consumer doesn't ack", done => {
            const consumer = sinon.spy(() => false);
            const q = new Queue(consumer);
            q.queue = [0, 1, 2];
            q.process();
            takeTen(() => {
                expect(consumer).to.have.been.calledWith(0);
                expect(consumer).to.have.callCount(1);
                expect(q.queue.length).to.equal(3);
            }, done);
        });

    });

    describe("`empty` method", () => {

        it("empties the queue", () => {
            const q = new Queue();
            q.process = sinon.spy();
            const element = {};
            q.push(element);
            expect(q.queue.length).to.equal(1);
            q.empty();
            expect(q.queue.length).to.equal(0);
        });

    });


});
